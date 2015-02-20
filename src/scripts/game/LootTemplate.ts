module SpaceTac.Game {
    "use strict";

    // Template used to generate a loot equipment
    export class LootTemplate {
        // Type of slot this equipment will fit in
        slot: SlotType;

        // Base name, lower cased
        name: string;

        // Capability requirement ranges (indexed by AttributeCode)
        requirements: IntegerRange[];

        // Distance to target
        distance: Range;

        // Effect area's radius
        blast: Range;

        // Duration, in number of turns
        duration: IntegerRange;

        // Permanent effects (when attached to an equipment slot)
        permanent_effects: EffectTemplate[];

        // Effects on target
        target_effects: EffectTemplate[];

        // Action Points usage
        ap_usage: Range;

        // Level requirement
        min_level: IntegerRange;

        // Create a loot template
        constructor(slot: SlotType, name: string) {
            this.slot = slot;
            this.name = name;
            this.requirements = [];
            this.distance = new Range(0, 0);
            this.blast = new Range(0, 0);
            this.duration = new IntegerRange(0, 0);
            this.ap_usage = new Range(0, 0);
            this.min_level = new IntegerRange(0, 0);
            this.permanent_effects = [];
            this.target_effects = [];
        }

        // Set a capability requirement
        addRequirement(capability: AttributeCode, min: number, max: number = null): void {
            this.requirements[capability] = new IntegerRange(min, max);
        }

        // Generate a random equipment with this template
        generate(random: RandomGenerator = null): Equipment {
            random = random || new RandomGenerator();
            var power = random.throw();
            return this.generateFixed(power);
        }

        // Generate a fixed-power equipment with this template
        generateFixed(power: number): Equipment {
            var result = new Equipment();

            result.slot = this.slot;
            result.code = Tools.getClassName(this);
            result.name = this.name;

            result.distance = this.distance.getProportional(power);
            result.blast = this.blast.getProportional(power);
            result.duration = this.duration.getProportional(power);
            result.ap_usage = this.ap_usage.getProportional(power);
            result.min_level = this.min_level.getProportional(power);

            result.action = this.getActionForEquipment(result);

            this.requirements.forEach((requirement: IntegerRange, index: AttributeCode) => {
                if (requirement) {
                    result.requirements.push(new Attribute(index, requirement.getProportional(power)));
                }
            });

            this.permanent_effects.forEach((eff_template: EffectTemplate) => {
                result.permanent_effects.push(eff_template.generateFixed(power));
            });
            this.target_effects.forEach((eff_template: EffectTemplate) => {
                result.target_effects.push(eff_template.generateFixed(power));
            });

            return result;
        }

        // Find the power range that will result in the level range
        getPowerRangeForLevel(level: IntegerRange): Range {
            if (level.min > this.min_level.max || level.max < this.min_level.min) {
                return null;
            } else {
                var min: number;
                var max: number;

                if (level.min <= this.min_level.min) {
                    min = 0.0;
                } else {
                    min = this.min_level.getReverseProportional(level.min);
                }
                if (level.max >= this.min_level.max) {
                    max = 1.0;
                } else {
                    max = this.min_level.getReverseProportional(level.max + 1);
                }

                return new Range(min, max);
            }
        }

        // Generate an equipment that will have its level requirement in the given range
        //  May return null if level range is not compatible with the template
        generateInLevelRange(level: IntegerRange, random: RandomGenerator = new RandomGenerator()): Equipment {
            var random_range = this.getPowerRangeForLevel(level);
            if (random_range) {
                var power = random.throw() * (random_range.max - random_range.min) + random_range.min;
                return this.generateFixed(power);
            } else {
                return null;
            }
        }

        // Convenience function to add a permanent attribute effect on equipment
        addPermanentAttributeValueEffect(code: AttributeCode, min: number, max: number = null): void {
            var template = new EffectTemplate(new AttributeValueEffect(code, 0));
            template.addModifier("value", new Range(min, max));
            this.permanent_effects.push(template);
        }

        // Convenience function to add a permanent attribute max effect on equipment
        addPermanentAttributeMaxEffect(code: AttributeCode, min: number, max: number = null): void {
            var template = new EffectTemplate(new AttributeMaxEffect(code, 0));
            template.addModifier("value", new Range(min, max));
            this.permanent_effects.push(template);
        }

        // Convenience function to add a "damage on target" effect
        addDamageOnTargetEffect(min: number, max: number = null): void {
            var template = new EffectTemplate(new DamageEffect(0));
            template.addModifier("value", new Range(min, max));
            this.target_effects.push(template);
        }

        // Method to reimplement to assign an action to a generated equipment
        protected getActionForEquipment(equipment: Equipment): BaseAction {
            return null;
        }
    }
}
