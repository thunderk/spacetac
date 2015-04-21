module SpaceTac.Game {
    "use strict";

    // Action to move to a given location
    export class MoveAction extends BaseAction {

        // Safety distance from other ships
        safety_distance: number;

        constructor(equipment: Equipment) {
            super("move", true, equipment);

            this.safety_distance = 50;
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

        getRangeRadius(ship: Ship): number {
            return ship.ap_current.current * this.equipment.distance / this.equipment.ap_usage;
        }

        checkLocationTarget(battle: Battle, ship: Ship, target: Target): Target {
            // Apply maximal distance
            var max_distance = this.equipment.distance * ship.ap_current.current / this.equipment.ap_usage;
            target = target.constraintInRange(ship.arena_x, ship.arena_y, max_distance);

            // Apply collision prevention
            battle.play_order.forEach((iship: Ship) => {
                if (iship !== ship) {
                    target = target.moveOutOfCircle(iship.arena_x, iship.arena_y, this.safety_distance,
                        ship.arena_x, ship.arena_y);
                }
            });

            return target;
        }

        protected customApply(battle: Battle, ship: Ship, target: Target): boolean {
            ship.moveTo(target.x, target.y);
            return true;
        }
    }
}
