module SpaceTac.Game {
    // Base class for action definitions
    export class BaseAction {
        // Identifier code for the type of action
        code: string;

        constructor(code: string) {
            this.code = code;
        }

        // Check basic conditions to know if the ship can use this action at all
        //  Method to reimplement to set conditions
        canBeUsed(battle: Battle, ship: Ship): boolean {
            return true;
        }

        // Method to check if a target is applicable for this action
        //  Will call checkLocationTarget or checkShipTarget by default
        checkTarget(battle: Battle, ship: Ship, target: Target): Target {
            if (!this.canBeUsed(battle, ship)) {
                return null;
            } else if (target.ship) {
                return this.checkShipTarget(battle, ship, target);
            } else {
                return this.checkLocationTarget(battle, ship, target);
            }
        }

        // Method to reimplement to check if a space target is applicable
        //  Must return null if the target can't be applied, an altered target, or the original target
        checkLocationTarget(battle: Battle, ship: Ship, target: Target): Target {
            return null;
        }

        // Method to reimplement to check if a ship target is applicable
        //  Must return null if the target can't be applied, an altered target, or the original target
        checkShipTarget(battle: Battle, ship: Ship, target: Target): Target {
            return null;
        }
    }
}