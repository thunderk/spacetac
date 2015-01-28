/// <reference path="BaseAction.ts"/>

module SpaceTac.Game {
    "use strict";

    // Action to fire a weapon on another ship, or in space
    export class FireWeaponAction extends BaseAction {
        constructor() {
            super("fire", true);
        }

        canBeUsed(battle: Battle, ship: Ship): boolean {
            return ship.ap_current.current > 0;
        }

        checkLocationTarget(battle: Battle, ship: Ship, target: Target): Target {
            // TODO In space targetting
            return null;
        }

        checkShipTarget(battle: Battle, ship: Ship, target: Target): Target {
            if (ship.getPlayer() === target.ship.getPlayer()) {
                // No friendly fire
                return null;
            } else {
                // TODO Limit by weapon range
                return target;
            }
        }

        protected customApply(battle: Battle, ship: Ship, target: Target): boolean {
            // TODO
            return false;
        }
    }
}
