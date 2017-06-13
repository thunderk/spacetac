/// <reference path="BaseEffect.ts"/>

module TS.SpaceTac {
    /**
     * Modify damage on ships.
     */
    export class DamageModifierEffect extends BaseEffect {
        // Percent factor (ex: -15 for -15%)
        factor: number

        constructor(factor = 0) {
            super("damagemod");

            this.factor = factor;
        }

        getDescription(): string {
            return `damage ${this.factor}%`;
        }

        isBeneficial(): boolean {
            return this.factor <= 0;
        }
    }
}
