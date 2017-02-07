module TS.SpaceTac.Game {
    // Base class for action definitions
    export class BaseAction {
        // Identifier code for the type of action
        code: string;

        // Human-readable name
        name: string;

        // Boolean at true if the action needs a target
        needs_target: boolean;

        // Equipment that triggers this action
        equipment: Equipment;

        // Create the action
        constructor(code: string, name: string, needs_target: boolean, equipment: Equipment = null) {
            this.code = code;
            this.name = name;
            this.needs_target = needs_target;
            this.equipment = equipment;
        }

        // Check basic conditions to know if the ship can use this action at all
        //  Method to reimplement to set conditions
        canBeUsed(battle: Battle, ship: Ship, remaining_ap: number = null): boolean {
            if (battle && battle.playing_ship !== ship) {
                // Ship is not playing
                return false;
            }

            // Check AP usage
            if (remaining_ap === null) {
                remaining_ap = ship.values.power.get();
            }
            var ap_usage = this.equipment ? this.equipment.ap_usage : 0;
            return remaining_ap >= ap_usage;
        }

        // Get the number of action points the action applied to a target would use
        getActionPointsUsage(battle: Battle, ship: Ship, target: Target): number {
            if (this.equipment) {
                return this.equipment.ap_usage;
            } else {
                return 0;
            }
        }

        // Get the range of this action
        getRangeRadius(ship: Ship): number {
            if (this.equipment) {
                return this.equipment.distance;
            } else {
                return 0;
            }
        }

        // Get the effect area radius of this action
        getBlastRadius(ship: Ship): number {
            if (this.equipment) {
                return this.equipment.blast;
            } else {
                return 0;
            }
        }

        // Method to check if a target is applicable for this action
        //  Will call checkLocationTarget or checkShipTarget by default
        checkTarget(battle: Battle, ship: Ship, target: Target): Target {
            if (!this.canBeUsed(battle, ship)) {
                return null;
            } else if (target) {
                if (target.ship) {
                    return this.checkShipTarget(battle, ship, target);
                } else {
                    return this.checkLocationTarget(battle, ship, target);
                }
            } else {
                return null;
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

        // Apply an action, returning true if it was successful
        apply(battle: Battle, ship: Ship, target: Target): boolean {
            if (this.canBeUsed(battle, ship)) {
                target = this.checkTarget(battle, ship, target);
                if (!target && this.needs_target) {
                    return false;
                }

                var cost = this.getActionPointsUsage(battle, ship, target);
                if (this.customApply(battle, ship, target)) {
                    if (cost > 0) {
                        ship.useActionPoints(cost);
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        // Method to reimplement to apply a action
        protected customApply(battle: Battle, ship: Ship, target: Target): boolean {
            return false;
        }
    }
}
