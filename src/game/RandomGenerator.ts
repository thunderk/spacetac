/// <reference path="Serializable.ts"/>

module TS.SpaceTac.Game {
    // Random generator, used in all throws
    export class RandomGenerator extends Serializable {
        // Array of next values, empty for a correct generator
        private fake_values: number[];

        // Basic constructor (can specify fake values as arguments)
        constructor(...values: number[]) {
            super();

            this.fake_values = [];

            values.forEach((value: number) => {
                this.forceNextValue(value);
            });
        }

        // Generate a value, based on an attribute level
        throw(level: number = 1): number {
            if (this.fake_values.length > 0) {
                return this.fake_values.shift() * level;
            } else {
                return Math.random() * level;
            }
        }

        // Generate a random integer value in a range
        throwInt(min: number, max: number): number {
            var value = this.throw(max - min + 1);
            return Math.floor(value) + min;
        }

        // Choose a random item from an array
        choice(items: any[]): any {
            var index = this.throwInt(0, items.length - 1);
            return items[index];
        }

        // Fake the generator, by forcing the next value
        // Call it several times to set future successive values
        // This value will replace the 0.0-1.0 random value, not the final one
        forceNextValue(value: number): void {
            if (value < 0.0) {
                value = 0.0;
            } else if (value >= 1.0) {
                value = 0.999999999;
            }
            this.fake_values.push(value);
        }
    }
}
