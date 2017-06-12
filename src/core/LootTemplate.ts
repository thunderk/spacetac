module TS.SpaceTac {
    /**
     * A leveled value is either a number multiplied by the level, or a custom iterator
     */
    type LeveledValue = number | Iterator<number>;

    /**
     * Modifiers of generated equipment
     */
    type QualityModifier = (equipment: Equipment, quality: EquipmentQuality, random: RandomGenerator) => boolean;
    type CommonModifier = (equipment: Equipment, level: number) => void;

    /**
     * Resolve a leveled value
     */
    function resolveForLevel(value: LeveledValue, level: number): number {
        if (typeof value === "number") {
            value *= level;
        } else {
            value = iat(value, level - 1) || 0;
        }
        return Math.floor(value);
    }

    /**
     * Template used to generate a BaseEffect for a given ship level
     */
    export class EffectTemplate<T extends BaseEffect> {
        // Basic instance of the effect
        effect: T;

        // Effect value modifiers
        modifiers: [keyof T, LeveledValue][];

        constructor(effect: T, modifiers: { [attr: string]: LeveledValue }) {
            this.effect = effect;
            this.modifiers = [];

            iteritems(modifiers, (key, value) => {
                if (effect.hasOwnProperty(key)) {
                    this.addModifier(<keyof T>key, value);
                }
            });
        }

        // Add a value modifier for the effect
        addModifier(name: keyof T, value: LeveledValue) {
            this.modifiers.push([name, value]);
        }

        // Generate an effect with a given level
        generate(level: number): T {
            let result = copy(this.effect);
            this.modifiers.forEach(modifier => {
                let [name, value] = modifier;
                (<any>result)[name] = resolveForLevel(value, level);
            });
            return result;
        }
    }

    /**
     * Template used to generate a BaseEffect for a given ship level
     */
    export class StickyEffectTemplate<T extends BaseEffect> extends EffectTemplate<BaseEffect> {
        duration: LeveledValue;

        constructor(effect: T, modifiers: { [attr: string]: LeveledValue }, duration: LeveledValue) {
            super(effect, modifiers);

            this.duration = duration;
        }

        generate(level: number): StickyEffect {
            let result = copy(this.effect);
            this.modifiers.forEach(modifier => {
                let [name, value] = modifier;
                (<any>result)[name] = resolveForLevel(value, level);
            });
            return new StickyEffect(result, resolveForLevel(this.duration, level), true);
        }
    }

    /**
     * Generic quality modifier
     */
    function standardQualityModifier(equipment: Equipment, quality: EquipmentQuality, random: RandomGenerator): boolean {
        // Collect available modifiers
        let modifiers: Function[] = [];

        let factor = 1;
        if (quality == EquipmentQuality.WEAK) {
            factor = 0.8;
        } else if (quality == EquipmentQuality.FINE) {
            factor = 1.1;
        } else if (quality == EquipmentQuality.PREMIUM) {
            factor = 1.3;
        } else if (quality == EquipmentQuality.LEGENDARY) {
            factor = 1.6;
        }

        if (quality == EquipmentQuality.WEAK && any(values(equipment.requirements), value => value > 0)) {
            modifiers.push(() => {
                iteritems(copy(equipment.requirements), (skill, value) => {
                    equipment.requirements[skill] = Math.max(equipment.requirements[skill] + 1, Math.floor(equipment.requirements[skill] / factor));
                });
            });
        }

        function simpleFactor<T>(obj: T, attr: keyof T, inverse = false) {
            let val = <any>obj[attr];
            if (val && val > 0) {
                let nval = Math.round((inverse ? (1 / factor) : factor) * val);
                if (nval != val) {
                    modifiers.push(() => (<any>obj)[attr] = nval);
                }
            }
        }

        function effectFactor(effect: BaseEffect) {
            if (effect instanceof ValueEffect || effect instanceof AttributeEffect) {
                simpleFactor(effect, 'value');
            } else if (effect instanceof AttributeLimitEffect) {
                simpleFactor(effect, 'value', true);
            } else if (effect instanceof StickyEffect) {
                simpleFactor(effect, 'duration');
                effectFactor(effect.base);
            } else if (effect instanceof DamageEffect) {
                simpleFactor(effect, 'base');
                simpleFactor(effect, 'span');
            }
        }

        equipment.effects.forEach(effectFactor);

        if (equipment.action instanceof FireWeaponAction) {
            simpleFactor(equipment.action, 'blast');
            simpleFactor(equipment.action, 'range');
            equipment.action.effects.forEach(effectFactor);
        }

        if (equipment.action instanceof DeployDroneAction) {
            simpleFactor(equipment.action, 'deploy_distance');
            simpleFactor(equipment.action, 'effect_radius');
            equipment.action.effects.forEach(effectFactor);
        }

        if (equipment.action instanceof MoveAction) {
            simpleFactor(equipment.action, 'distance_per_power');
        }

        if (equipment.cooldown.overheat) {
            simpleFactor(equipment.cooldown, 'overheat', true);
            simpleFactor(equipment.cooldown, 'cooling', true);
        }

        // Choose a random one
        if (modifiers.length > 0) {
            let chosen = random.choice(modifiers);
            chosen();
            equipment.price = Math.ceil(equipment.price * factor * factor);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Template used to generate a loot equipment
     */
    export class LootTemplate {
        // Type of slot this equipment will fit in
        slot: SlotType

        // Base name that will be given to generated equipment
        name: string

        // Generic description of the equipment
        description: string

        // Base price
        price: LeveledValue

        // Modifiers applied to obtain the "common" equipment, based on level
        protected base_modifiers: CommonModifier[]

        // Modifiers applied to "common" equipment to obtain a specific quality
        protected quality_modifiers: QualityModifier[]

        constructor(slot: SlotType, name: string, description = "") {
            this.slot = slot;
            this.name = name;
            this.description = description;
            this.price = istep(100, istep(200, irepeat(200)));
            this.base_modifiers = [];
            this.quality_modifiers = [standardQualityModifier];
        }

        /**
         * Generate a new equipment of a given level and quality
         */
        generate(level: number, quality = EquipmentQuality.COMMON, random = RandomGenerator.global): Equipment {
            let result = new Equipment(this.slot, (this.name || "").toLowerCase().replace(/ /g, ""));

            result.level = level;
            result.name = this.name;
            result.description = this.description;
            result.price = resolveForLevel(this.price, level);

            this.base_modifiers.forEach(modifier => modifier(result, level));

            if (quality == EquipmentQuality.COMMON) {
                result.quality = quality;
            } else {
                let quality_applied = this.quality_modifiers.map(modifier => modifier(result, quality, random));
                result.quality = any(quality_applied, x => x) ? quality : EquipmentQuality.COMMON;
            }

            return result;
        }

        /**
         * Generate the highest equipment level, for a given set of skills
         */
        generateHighest(skills: ShipSkills, quality = EquipmentQuality.COMMON, random = RandomGenerator.global): Equipment | null {
            let level = 1;
            let equipment: Equipment | null = null;
            let attributes = new ShipAttributes();
            keys(skills).forEach(skill => attributes[skill].set(skills[skill].get()));
            do {
                let nequipment = this.generate(level, quality, random);
                if (nequipment.canBeEquipped(attributes)) {
                    equipment = nequipment;
                } else {
                    break;
                }
                level += 1;
            } while (level < 100);
            return equipment;
        }

        /**
         * Set skill requirements that will be added to each level of equipment.
         */
        setSkillsRequirements(skills: { [skill: string]: LeveledValue }): void {
            this.base_modifiers.push((equipment, level) => {
                iteritems(skills, (skill, value) => {
                    let resolved = resolveForLevel(value, level);
                    if (resolved > 0) {
                        equipment.requirements[skill] = (equipment.requirements[skill] || 0) + resolved;
                    }
                });
            });
        }

        /**
         * Set the overheat/cooldown
         */
        setCooldown(overheat: LeveledValue, cooldown: LeveledValue): void {
            this.base_modifiers.push((equipment, level) => {
                equipment.cooldown.configure(resolveForLevel(overheat, level), resolveForLevel(cooldown, level));
            });
        }

        /**
         * Add a permanent attribute effect, when the item is equipped.
         */
        addAttributeEffect(attribute: keyof ShipAttributes, value: LeveledValue): void {
            this.base_modifiers.push((equipment, level) => {
                let resolved = resolveForLevel(value, level);
                if (resolved > 0) {
                    equipment.effects.push(new AttributeEffect(attribute, resolved));
                }
            });
        }

        /**
         * Add a move action.
         */
        addMoveAction(distance_per_power: LeveledValue): void {
            this.base_modifiers.push((equipment, level) => {
                equipment.action = new MoveAction(equipment, resolveForLevel(distance_per_power, level));
            });
        }

        /**
         * Add a fire weapon action.
         */
        addFireAction(power: LeveledValue, range: LeveledValue, blast: LeveledValue, effects: EffectTemplate<BaseEffect>[]): void {
            this.base_modifiers.push((equipment, level) => {
                let reffects = effects.map(effect => effect.generate(level));
                equipment.action = new FireWeaponAction(equipment, resolveForLevel(power, level), resolveForLevel(range, level), resolveForLevel(blast, level), reffects);
            });
        }

        /**
         * Add a deploy drone action.
         */
        addDroneAction(power: LeveledValue, range: LeveledValue, lifetime: LeveledValue, radius: LeveledValue, effects: EffectTemplate<BaseEffect>[]): void {
            this.base_modifiers.push((equipment, level) => {
                let reffects = effects.map(effect => effect.generate(level));
                equipment.action = new DeployDroneAction(equipment, resolveForLevel(power, level), resolveForLevel(range, level), resolveForLevel(lifetime, level), resolveForLevel(radius, level), reffects);
            });
        }

        /**
         * Add a toggle action.
         */
        addToggleAction(power: LeveledValue, radius: LeveledValue, effects: EffectTemplate<BaseEffect>[]): void {
            this.base_modifiers.push((equipment, level) => {
                let reffects = effects.map(effect => effect.generate(level));
                equipment.action = new ToggleAction(equipment, resolveForLevel(power, level), resolveForLevel(radius, level), reffects);
            });
        }

        /**
         * Check if the template has any damage effect (to know if is an offensive weapon)
         */
        hasDamageEffect(): boolean {
            let example = this.generate(1);
            let action = example.action;
            if (action instanceof FireWeaponAction || action instanceof DeployDroneAction) {
                return any(action.effects, effect => effect instanceof DamageEffect || (effect instanceof StickyEffect && effect.base instanceof DamageEffect));
            } else {
                return false;
            }
        }
    }
}
