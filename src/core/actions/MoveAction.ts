module TS.SpaceTac {
    // Action to move to a given location
    export class MoveAction extends BaseAction {

        // Safety distance from other ships
        safety_distance: number;

        constructor(equipment: Equipment) {
            super("move", "Move", true, equipment);

            this.safety_distance = 50;
        }

        checkCannotBeApplied(ship: Ship, remaining_ap: number = null): string | null {
            let base = super.checkCannotBeApplied(ship, Infinity);
            if (base) {
                return base;
            }

            // Check AP usage
            if (remaining_ap === null) {
                remaining_ap = ship.values.power.get();
            }
            if (remaining_ap > 0.0001) {
                return null
            } else {
                return "not enough power";
            }
        }

        getActionPointsUsage(ship: Ship, target: Target): number {
            if (target === null) {
                return 0;
            }

            var distance = Target.newFromShip(ship).getDistanceTo(target);
            return Math.ceil(this.equipment.ap_usage * distance / this.equipment.distance);
        }

        getRangeRadius(ship: Ship): number {
            return ship.values.power.get() * this.equipment.distance / this.equipment.ap_usage;
        }

        /**
         * Get the distance that may be traveled with 1 action point
         */
        getDistanceByActionPoint(ship: Ship): number {
            return this.equipment.distance / this.equipment.ap_usage;
        }

        checkLocationTarget(ship: Ship, target: Target): Target {
            // Apply maximal distance
            var max_distance = this.getRangeRadius(ship);
            target = target.constraintInRange(ship.arena_x, ship.arena_y, max_distance);

            // Apply collision prevention
            let battle = ship.getBattle();
            if (battle) {
                battle.play_order.forEach((iship: Ship) => {
                    if (iship !== ship) {
                        target = target.moveOutOfCircle(iship.arena_x, iship.arena_y, this.safety_distance,
                            ship.arena_x, ship.arena_y);
                    }
                });
            }

            return target;
        }

        protected customApply(ship: Ship, target: Target) {
            ship.moveTo(target.x, target.y);
        }
    }
}
