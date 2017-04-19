module TS.SpaceTac {
    /**
     * A leveled value is either a number multiplied by the level, or a custom iterator
     */
    type LeveledValue = number | Iterator<number>;

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
     * Template used to generate a loot equipment
     */
    export class LootTemplate {
        // Type of slot this equipment will fit in
        slot: SlotType

        // Base name that will be given to generated equipment
        name: string

        // Generic description of the equipment
        description: string

        // Modifiers applied to obtain the "common" equipment, based on level
        protected base_modifiers: ((equipment: Equipment, level: number) => void)[];

        constructor(slot: SlotType, name: string, description = "") {
            this.slot = slot;
            this.name = name;
            this.description = description;
            this.base_modifiers = [];
        }

        /**
         * Generate a new equipment of a given level and quality
         */
        generate(level: number, quality = EquipmentQuality.COMMON, random = RandomGenerator.global): Equipment {
            let result = new Equipment(this.slot, (this.name || "").toLowerCase().replace(/ /g, ""));

            result.level = level;
            result.quality = quality;
            result.name = this.name;
            result.description = this.description;

            this.base_modifiers.forEach(modifier => modifier(result, level));

            return result;
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
    }
}
