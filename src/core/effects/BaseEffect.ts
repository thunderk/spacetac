/// <reference path="../diffs/BaseBattleDiff.ts" />

module TK.SpaceTac {
    export type EffectAmount = number | { base: number, span: number };

    /**
     * Base class for effects of actions that can be applied on ships
     * 
     * Effects will generate diffs to modify the battle state
     */
    export class BaseEffect extends RObject {
        // Identifier code for the type of effect
        code: string

        constructor(code: string) {
            super();

            this.code = code;
        }

        /**
         * Get the list of diffs needed to activate this effect on a ship
         */
        getOnDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            return [];
        }

        /**
         * Get the list of diffs needed to remove this effect on a ship
         */
        getOffDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            return [];
        }

        // Return true if the effect is beneficial to the ship, false if it's a drawback
        isBeneficial(): boolean {
            return false;
        }

        // Get a full code, that can be used to identify this effect (for example: "attrlimit-aprecovery")
        getFullCode(): string {
            return this.code;
        }

        // Return a human readable description
        getDescription(): string {
            return "unknown effect";
        }

        /**
         * Resolve an effect amount
         */
        resolveAmount(val: EffectAmount, random = RandomGenerator.global): number {
            if (typeof val == "number") {
                return val;
            } else if (val.span) {
                return random.randInt(val.base, val.base + val.span);
            } else {
                return val.base;
            }
        }
    }
}
