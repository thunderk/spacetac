module TS.SpaceTac {
    // A unique name generator
    export class NameGenerator {
        // List of available choices
        private choices: string[];

        // Random generator to use
        private random: RandomGenerator;

        constructor(choices: string[], random: RandomGenerator = new RandomGenerator()) {
            this.choices = acopy(choices);
            this.random = random;
        }

        // Get a new unique name from available choices
        getName(): string | null {
            if (this.choices.length === 0) {
                return null;
            }

            var index = this.random.randInt(0, this.choices.length - 1);
            var result = this.choices[index];
            this.choices.splice(index, 1);
            return result;
        }
    }
}
