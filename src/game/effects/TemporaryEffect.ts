/// <reference path="BaseEffect.ts"/>

module SpaceTac.Game {
    // Base class for actions that will stick to a target for a number of rounds
    export class TemporaryEffect extends BaseEffect {
        // Duration, in number of turns
        duration: number;

        // Base constructor
        constructor(code: string, duration: number = 0) {
            super(code);

            this.duration = duration;
        }

        applyOnShip(ship: Ship): boolean {
            ship.addTemporaryEffect(this);
            this.singleApply(ship, true);
            return true;
        }

        // Method to implement to apply the effect ponctually
        //   on_stick is true when this is called by applyOnShip, and false when called at turn start
        singleApply(ship: Ship, on_stick: boolean): void {
            // Abstract
        }

        // Get a full code, that can be used to identify this effect (for example: "attrlimit-aprecovery")
        getFullCode(): string {
            return this.code;
        }
    }
}
