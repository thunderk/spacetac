module TK {
    /*
     * Random generator.
     */
    export class RandomGenerator {
        static global: RandomGenerator = new RandomGenerator();

        postUnserialize() {
            this.random = Math.random;
        }

        /**
         * Get a random number in the (0.0 included -> 1.0 excluded) range
         */
        random = Math.random;

        /**
         * Get a random number in the (*from* included -> *to* included) range
         */
        randInt(from: number, to: number): number {
            return Math.floor(this.random() * (to - from + 1)) + from;
        }

        /**
         * Choose a random item in an array
         */
        choice<T>(input: T[]): T {
            return input[this.randInt(0, input.length - 1)];
        }

        /**
         * Choose a random sample of items from an array
         */
        sample<T>(input: T[], count: number): T[] {
            var minput = input.slice();
            var result: T[] = [];
            while (count--) {
                var idx = this.randInt(0, minput.length - 1);
                result.push(minput[idx]);
                minput.splice(idx, 1);
            }
            return result;
        }

        /**
         * Get a random boolean (coin toss)
         */
        bool(): boolean {
            return this.randInt(0, 1) == 0;
        }

        /**
         * Get the range in which the number falls, ranges being weighted
         */
        weighted(weights: number[]): number {
            if (weights.length == 0) {
                return -1;
            }

            let total = sum(weights);
            if (total == 0) {
                return 0;
            } else {
                let cumul = 0;
                weights = weights.map(weight => {
                    cumul += weight / total;
                    return cumul;
                });
                let r = this.random();
                for (let i = 0; i < weights.length; i++) {
                    if (r < weights[i]) {
                        return i;
                    }
                }
                return weights.length - 1;
            }
        }

        /**
         * Generate a random id string, composed of ascii characters
         */
        id(length: number, chars?: string): string {
            if (!chars) {
                chars = range(94).map(i => String.fromCharCode(i + 33)).join("");
            }
            return range(length).map(() => this.choice(<any>chars)).join("");
        }
    }

    /*
     * Random generator that produces a series of fixed numbers before going back to random ones.
     */
    export class SkewedRandomGenerator extends RandomGenerator {
        i = 0;
        suite: number[];
        loop: boolean;

        constructor(suite: number[], loop = false) {
            super();

            this.suite = suite;
            this.loop = loop;
        }

        random = () => {
            var result = this.suite[this.i];
            this.i += 1;
            if (this.loop && this.i == this.suite.length) {
                this.i = 0;
            }
            return (typeof result == "undefined") ? Math.random() : result;
        }
    }
}