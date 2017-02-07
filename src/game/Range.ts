module TS.SpaceTac.Game {
    // Range of number values
    export class Range {
        // Minimal value
        min: number;

        // Maximal value
        max: number;

        // Create a range of values
        constructor(min: number, max: number = null) {
            this.set(min, max);
        }

        // Change the range
        set(min: number, max: number = null) {
            this.min = min;
            if (max === null) {
                this.max = this.min;
            } else {
                this.max = max;
            }
        }

        // Get a proportional value (give 0.0-1.0 value to obtain a value in range)
        getProportional(cursor: number): number {
            if (cursor <= 0.0) {
                return this.min;
            } else if (cursor >= 1.0) {
                return this.max;
            } else {
                return (this.max - this.min) * cursor + this.min;
            }
        }

        // Get the value of the cursor that would give this proportional value (in 0.0-1.0 range)
        getReverseProportional(expected: number): number {
            if (expected <= this.min) {
                return 0;
            } else if (expected >= this.max) {
                return 1;
            } else {
                return (expected - this.min) / (this.max - this.min);
            }
        }

        // Check if a value is in the range
        isInRange(value: number): boolean {
            return value >= this.min && value <= this.max;
        }
    }


    // Range of integer values
    //
    //  This differs from Range in that it adds space in proportional values to include the 'max'.
    //  Typically, using Range for integers will only yield 'max' for exactly 1.0 proportional, not for 0.999999.
    //  This fixes this behavior.
    //
    //  As this rounds values to integer, the 'reverse' proportional is no longer a bijection.
    export class IntegerRange extends Range {
        getProportional(cursor: number): number {
            if (cursor <= 0.0) {
                return this.min;
            } else if (cursor >= 1.0) {
                return this.max;
            } else {
                return Math.floor((this.max - this.min + 1) * cursor + this.min);
            }
        }

        getReverseProportional(expected: number): number {
            if (expected <= this.min) {
                return 0;
            } else if (expected > this.max) {
                return 1;
            } else {
                return (expected - this.min) * 1.0 / (this.max - this.min + 1);
            }
        }
    }
}
