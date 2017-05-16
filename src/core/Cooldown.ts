module TS.SpaceTac {
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

        // Number of turns needed to cooldown when overheated
        cooling = 0

        constructor(overheat = 0, cooling = 0) {
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
            return (this.heat > 0) ? 0 : (this.overheat - this.uses);
        }

        /**
         * Configure the overheat and cooling
         */
        configure(overheat: number, cooling: number) {
            this.overheat = overheat;
            this.cooling = cooling;
            this.reset();
        }

        /**
         * Use the equipment, increasing the heat
         */
        use(): void {
            if (this.overheat) {
                this.uses += 1;
                if (this.uses >= this.overheat) {
                    this.heat = this.cooling + 1;
                }
            }
        }

        /**
         * Apply one cooling-down step if necessary
         */
        cool(): void {
            this.uses = 0;
            if (this.heat > 0) {
                this.heat -= 1;
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
