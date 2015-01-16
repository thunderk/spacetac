module SpaceTac.Game {
    "use strict";

    // Template used to generate a loot equipment
    export class LootTemplate {
        // Type of slot this equipment will fit in
        slot: SlotType;

        // Base name, lower cased
        name: string;

        // Ability requirement ranges

        // Targetting flags

        // Distance to target
        distance: Range;

        // Effect area's radius
        blast: Range;

        // Duration, in number of turns
        duration: IntegerRange;

        // Effects

        // Action Points usage
        ap_usage: Range;

        // Level requirement
        min_level: IntegerRange;

        // Create a loot template
        constructor(slot: SlotType, name: string) {
            this.slot = slot;
            this.name = name;
            this.distance = new Range(0, 0);
            this.blast = new Range(0, 0);
            this.duration = new IntegerRange(0, 0);
            this.ap_usage = new Range(0, 0);
            this.min_level = new IntegerRange(0, 0);
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
            result.name = this.name;

            result.distance = this.distance.getProportional(power);
            result.blast = this.blast.getProportional(power);
            result.duration = this.duration.getProportional(power);
            result.ap_usage = this.ap_usage.getProportional(power);
            result.min_level = this.min_level.getProportional(power);

            result.action = this.getActionForEquipment(result);

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
        generateInLevelRange(level: IntegerRange, random: RandomGenerator = null): Equipment {
            random = random || new RandomGenerator();

            var random_range = this.getPowerRangeForLevel(level);
            if (random_range) {
                var power = random.throw() * (random_range.max - random_range.min) + random_range.min;
                return this.generateFixed(power);
            } else {
                return null;
            }
        }

        // Method to reimplement to assign an action to a generated equipment
        protected getActionForEquipment(equipment: Equipment): BaseAction {
            return null;
        }
    }
}
