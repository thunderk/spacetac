module TK.SpaceTac {
    /**
     * A leveled value is an iterator yielding the desired value for each level (first item is for level 1, and so on)
     */
    type LeveledValue = Iterator<number>;
    type LeveledModifiers<T extends BaseEffect> = {[P in keyof T]?: LeveledValue }

    /**
     * Modifiers of generated equipment
     */
    type QualityModifier = (equipment: Equipment, quality: EquipmentQuality, random: RandomGenerator) => boolean;
    type CommonModifier = (equipment: Equipment, level: number) => void;

    /**
     * Resolve a leveled value
     */
    function resolveForLevel(value: LeveledValue, level: number): number {
        let lvalue = iat(value, level - 1) || 0;
        return Math.floor(lvalue);
    }

    /**
     * Balanced generic leveled value
     */
    export function leveled(base: number, increment = base * 0.4, exponent = 0.2): LeveledValue {
        return istep(base, istep(increment, irepeat(increment * exponent)));
    }

    /**
     * Template used to generate a BaseEffect for a given ship level
     */
    export class EffectTemplate<T extends BaseEffect> {
        // Basic instance of the effect
        effect: T;

        // Effect value modifiers
        modifiers: [keyof T, LeveledValue][];

        constructor(effect: T, modifiers: LeveledModifiers<T>) {
            this.effect = effect;
            this.modifiers = [];

            iteritems(modifiers, (key, value) => {
                if (effect.hasOwnProperty(key) && value) {
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
                result[name] = resolveForLevel(value, level);
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
            return new StickyEffect(result, resolveForLevel(this.duration, level));
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

        constructor(slot: SlotType, name: string, description = "", base_price = 100) {
            this.slot = slot;
            this.name = name;
            this.description = description;
            this.price = leveled(base_price, base_price * 2.5, 1);
            this.base_modifiers = [];
            this.quality_modifiers = [LootQualityModifiers.applyStandard];
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
            keys(skills).forEach(skill => attributes[skill].addModifier(skills[skill].get()));
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
                if (resolved != 0) {
                    equipment.effects.push(new AttributeEffect(attribute, resolved));
                }
            });
        }

        /**
         * Add a move action.
         */
        addMoveAction(distance_per_power: LeveledValue, safety_distance: LeveledValue = irepeat(120), maneuvrability_factor: LeveledValue = irepeat(80)): void {
            this.base_modifiers.push((equipment, level) => {
                equipment.action = new MoveAction(equipment, resolveForLevel(distance_per_power, level), resolveForLevel(safety_distance, level), resolveForLevel(maneuvrability_factor, level));
            });
        }

        /**
         * Add a trigger action.
         */
        addTriggerAction(power: LeveledValue, effects: EffectTemplate<any>[], range: LeveledValue = irepeat(0), blast: LeveledValue = irepeat(0), angle: LeveledValue = irepeat(0), aim: LeveledValue = irepeat(0), evasion: LeveledValue = irepeat(0), luck: LeveledValue = irepeat(0)): void {
            this.base_modifiers.push((equipment, level) => {
                let reffects = effects.map(effect => effect.generate(level));
                equipment.action = new TriggerAction(equipment, reffects, resolveForLevel(power, level), resolveForLevel(range, level), resolveForLevel(blast, level), resolveForLevel(angle, level), resolveForLevel(aim, level), resolveForLevel(evasion, level), resolveForLevel(luck, level));
            });
        }

        /**
         * Add a deploy drone action.
         */
        addDroneAction(power: LeveledValue, range: LeveledValue, radius: LeveledValue, effects: EffectTemplate<any>[]): void {
            this.base_modifiers.push((equipment, level) => {
                let reffects = effects.map(effect => effect.generate(level));
                equipment.action = new DeployDroneAction(equipment, resolveForLevel(power, level), resolveForLevel(range, level), resolveForLevel(radius, level), reffects);
            });
        }

        /**
         * Add a toggle action.
         */
        addToggleAction(power: LeveledValue, radius: LeveledValue, effects: EffectTemplate<any>[]): void {
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
            if (action instanceof TriggerAction || action instanceof DeployDroneAction) {
                return any(action.effects, effect => effect instanceof DamageEffect || (effect instanceof StickyEffect && effect.base instanceof DamageEffect));
            } else {
                return false;
            }
        }
    }
}
