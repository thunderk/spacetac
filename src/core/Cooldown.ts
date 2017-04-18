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

        /**
         * Check if the equipment can be used in regards to heat
         */
        canUse(): boolean {
            return this.heat == 0;
        }

        /**
         * Configure the overheat and cooling
         */
        configure(overheat: number, cooling: number) {
            this.overheat = overheat;
            this.cooling = cooling;
        }

        /**
         * Use the equipment, increasing the heat
         */
        use(): void {
            this.uses += 1;
            if (this.uses >= this.overheat) {
                this.heat = this.cooling;
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
    }
}
