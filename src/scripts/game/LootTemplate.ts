module SpaceTac.Game {
    "use strict";

    // Range of values
    export class Range {
        // Minimal value
        private min: number;

        // Maximal value
        private max: number;

        // Create a range of values
        constructor(min: number, max: number) {
            this.min = min;
            this.max = max;
        }

        // Get a proportional value (give 0.0-1.0 value to obtain a value in range)
        getProportional(cursor: number) :number {
            return (this.max - this.min) * cursor + this.min;
        }
    }

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

        // Duration
        duration: Range;

        // Effects

        // Action Points usage
        ap_usage: Range;

        // Level requirement
        min_level: Range;

        // Create a loot template
        constructor(slot: SlotType, name: string) {
            this.slot = slot;
            this.name = name;
            this.distance = new Range(0, 0);
            this.blast = new Range(0, 0);
            this.duration = new Range(0, 0);
            this.ap_usage = new Range(0, 0);
            this.min_level = new Range(0, 0);
        }

        // Generate a random equipment with this template
        generate(): Equipment {
            var random = new RandomGenerator();
            var power = random.throw();
            return this.generateFixed(power);
        }

        // Generate a fixed-power equipment with this template
        generateFixed(power: number): Equipment {
            var result = new Equipment();

            result.slot = this.slot;
            result.name = this.name;

            result.distance = Math.floor(this.distance.getProportional(power));
            result.blast = Math.floor(this.blast.getProportional(power));
            result.duration = Math.floor(this.duration.getProportional(power));
            result.ap_usage = Math.floor(this.ap_usage.getProportional(power));
            result.min_level = Math.floor(this.min_level.getProportional(power));

            return result;
        }
    }
}
