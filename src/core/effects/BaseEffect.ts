/// <reference path="../diffs/BaseBattleDiff.ts" />

module TK.SpaceTac {
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
        getOnDiffs(ship: Ship, source: Ship | Drone, success = 1): BaseBattleDiff[] {
            return [];
        }

        /**
         * Get the list of diffs needed to remove this effect on a ship
         */
        getOffDiffs(ship: Ship): BaseBattleDiff[] {
            return [];
        }

        /**
         * Get the list of diffs to apply when this effect is active on a ship beginning its turn
         */
        getTurnStartDiffs(ship: Ship): BaseBattleDiff[] {
            return [];
        }

        /**
         * Get the list of diffs to apply when this effect is active on a ship ending its turn
         */
        getTurnEndDiffs(ship: Ship): BaseBattleDiff[] {
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
    }
}
