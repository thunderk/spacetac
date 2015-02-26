module SpaceTac.Game {
    "use strict";

    // Action to move to a given location
    export class MoveAction extends BaseAction {
        constructor(equipment: Equipment) {
            super("move", true, equipment);
        }

        canBeUsed(battle: Battle, ship: Ship, remaining_ap: number = null): boolean {
            if (battle && battle.playing_ship !== ship) {
                return false;
            }

            // Check AP usage
            if (remaining_ap === null) {
                remaining_ap = ship.ap_current.current;
            }
            return remaining_ap > 0.0001;
        }

        getActionPointsUsage(battle: Battle, ship: Ship, target: Target): number {
            if (target === null) {
                return 0;
            }

            var distance = Target.newFromShip(ship).getDistanceTo(target);
            return this.equipment.ap_usage * distance / this.equipment.distance;
        }

        checkLocationTarget(battle: Battle, ship: Ship, target: Target): Target {
            // TODO Should forbid to move too much near another ship
            var max_distance = this.equipment.distance * ship.ap_current.current / this.equipment.ap_usage;
            return target.constraintInRange(ship.arena_x, ship.arena_y, max_distance);
        }

        protected customApply(battle: Battle, ship: Ship, target: Target): boolean {
            ship.moveTo(target.x, target.y);
            return true;
        }
    }
}
