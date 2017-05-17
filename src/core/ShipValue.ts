module TS.SpaceTac {
    /**
     * A ship value is a number that may vary and be constrained in a given range.
     */
    export class ShipValue {
        // Name of the value
        name: string

        // Current value
        private current: number

        // Upper bound
        private maximal: number | null

        constructor(code: string, current = 0, maximal: number | null = null) {
            this.name = code;
            this.current = current;
            this.maximal = maximal;
        }

        /**
         * Get the current value
         */
        get(): number {
            return this.current;
        }

        /**
         * Get the maximal value
         */
        getMaximal(): number | null {
            return this.maximal;
        }

        /**
         * Set the upper bound the value must not cross
         */
        setMaximal(value: number): void {
            this.maximal = value;
            this.fix();
        }

        /**
         * Set an absolute value
         * 
         * Returns the variation in value
         */
        set(value: number): number {
            var old_value = this.current;
            this.current = value;
            this.fix();
            return this.current - old_value;
        }

        /** 
         * Add an offset to current value
         * 
         * Returns true if the value changed
         */
        add(value: number): number {
            var old_value = this.current;
            this.current += value;
            this.fix();
            return this.current - old_value;
        }

        /**
         * Fix the value to be positive and lower than maximal
         */
        private fix(): void {
            if (this.maximal !== null && this.current > this.maximal) {
                this.current = this.maximal;
            }
            if (this.current < 0) {
                this.current = 0;
            }
        }
    }
}
