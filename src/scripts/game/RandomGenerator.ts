module SpaceTac.Game {
    // Random generator, used in all throws
    export class RandomGenerator {
        // Array of next values, empty for a correct generator
        private fake_values: number[];

        // Basic constructor (can specify fake values as arguments)
        constructor(...values: number[]) {
            this.fake_values = values;
        }

        // Generate a value, based on an attribute level
        throw(level: number): number {
            if (this.fake_values.length > 0) {
                return this.fake_values.shift() * level;
            }
            else {
                return Math.random() * level;
            }
        }

        // Fake the generator, by forcing the next value
        // Call it several times to set future successive values
        // This value will replace the 0.0-1.0 random value, not the final one
        forceNextValue(value: number): void {
            this.fake_values.push(value);
        }
    }
}