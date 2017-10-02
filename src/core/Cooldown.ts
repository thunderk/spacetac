module TK.SpaceTac {
    /**
     * Cooldown system for equipments
     */
    export class Cooldown {
        // Number of uses in the current turn
        uses = 0

        // Accumulated heat to dissipate (number of turns)
        heat = 0

        // Maximum number of uses allowed per turn before overheating (0 for unlimited)
        overheat = 0

        // Number of "end turn" needed to cooldown when overheated
        cooling = 1

        constructor(overheat = 0, cooling = 1) {
            this.configure(overheat, cooling);
        }

        toString(): string {
            return `Overheat ${this.overheat} / Cooldown ${this.cooling}`;
        }

        /**
         * Check if the equipment can be used in regards to heat
         */
        canUse(): boolean {
            return this.heat == 0;
        }

        /**
         * Check if the equipment would overheat if used
         */
        willOverheat(): boolean {
            return this.overheat > 0 && this.uses + 1 >= this.overheat;
        }

        /**
         * Check the number of uses before overheating
         */
        getRemainingUses(): number {
            if (this.overheat) {
                return (this.heat > 0) ? 0 : (this.overheat - this.uses);
            } else {
                return Infinity;
            }
        }

        /**
         * Configure the overheat and cooling
         */
        configure(overheat: number, cooling: number) {
            this.overheat = overheat;
            this.cooling = Math.max(1, cooling);
            this.reset();
        }

        /**
         * Use the equipment, increasing the heat
         */
        use(): void {
            if (this.overheat) {
                this.uses += 1;
                if (this.uses >= this.overheat) {
                    this.heat = this.cooling;
                }
            }
        }

        /**
         * Apply one cooling-down step if necessary
         */
        cool(steps = 1): void {
            this.heat = Math.max(this.heat - steps, 0);

            if (this.heat == 0) {
                this.uses = 0;
            }
        }

        /**
         * Reset the cooldown (typically at the end of turn)
         */
        reset(): void {
            this.uses = 0;
            this.heat = 0;
        }
    }
}
