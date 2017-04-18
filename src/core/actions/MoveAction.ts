module TS.SpaceTac {
    // Action to move to a given location
    export class MoveAction extends BaseAction {
        // Distance allowed for each power point
        distance_per_power: number;

        // Safety distance from other ships
        safety_distance: number;

        // Equipment cannot be null (engine)
        equipment: Equipment;

        constructor(equipment: Equipment, distance_per_power = 0) {
            super("move", "Move", true, equipment);

            this.distance_per_power = distance_per_power;
            this.safety_distance = 50;
        }

        checkCannotBeApplied(ship: Ship, remaining_ap: number | null = null): string | null {
            let base = super.checkCannotBeApplied(ship, Infinity);
            if (base) {
                return base;
            }

            // Check AP usage
            if (remaining_ap === null) {
                remaining_ap = ship.values.power.get();
            }
            if (remaining_ap > 0.0001) {
                return null;
            } else {
                return "not enough power";
            }
        }

        getActionPointsUsage(ship: Ship, target: Target): number {
            if (target === null) {
                return 0;
            }

            var distance = Target.newFromShip(ship).getDistanceTo(target);
            return Math.ceil(distance / this.distance_per_power);
        }

        getRangeRadius(ship: Ship): number {
            return ship.values.power.get() * this.distance_per_power;
        }

        /**
         * Get the distance that may be traveled with 1 action point
         */
        getDistanceByActionPoint(ship: Ship): number {
            return this.distance_per_power;
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

        getEffectsDescription(): string {
            return `Move: ${this.distance_per_power}km per power point`;
        }
    }
}
