/// <reference path="BaseAction.ts"/>

module SpaceTac.Game {
    "use strict";

    // Action to fire a weapon on another ship, or in space
    export class FireWeaponAction extends BaseAction {
        // Boolean set to true if the weapon can target space
        can_target_space: boolean;

        constructor(equipment: Equipment, can_target_space: boolean = false) {
            super("fire", true, equipment);

            this.can_target_space = can_target_space;
        }

        canBeUsed(battle: Battle, ship: Ship): boolean {
            return ship.ap_current.current > 0;
        }

        checkLocationTarget(battle: Battle, ship: Ship, target: Target): Target {
            if (this.can_target_space) {
                target = target.constraintInRange(ship.arena_x, ship.arena_y, this.equipment.distance);
                return target;
            } else {
                return null;
            }
        }

        checkShipTarget(battle: Battle, ship: Ship, target: Target): Target {
            if (ship.getPlayer() === target.ship.getPlayer()) {
                // No friendly fire
                return null;
            } else {
                // Check if target is in range
                if (target.isInRange(ship.arena_x, ship.arena_y, this.equipment.distance)) {
                    return target;
                } else {
                    return null;
                }
            }
        }

        protected customApply(battle: Battle, ship: Ship, target: Target): boolean {
            if (target.ship) {
                // Apply all target effects
                var result = false;
                this.equipment.target_effects.forEach((effect: BaseEffect) => {
                    var eff_result = effect.applyOnShip(target.ship);
                    result = result || eff_result;
                });

                // Consume AP
                if (result) {
                    ship.useActionPoints(this.equipment.ap_usage);
                }

                return result;
            } else {
                // TODO target in space (=> apply blast radius)
                return false;
            }

        }
    }
}
