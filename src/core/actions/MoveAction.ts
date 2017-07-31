module TS.SpaceTac {
    // Action to move to a given location
    export class MoveAction extends BaseAction {
        // Distance allowed for each power point
        distance_per_power: number

        // Safety distance from other ships and arena borders
        safety_distance: number

        // Equipment cannot be null (engine)
        equipment: Equipment

        constructor(equipment: Equipment, distance_per_power = 0, safety_distance = 120) {
            super("move", "Move", true, equipment);

            this.distance_per_power = distance_per_power;
            this.safety_distance = safety_distance;
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

        /**
         * Apply exclusion areas (neer arena borders, or other ships)
         */
        applyExclusion(ship: Ship, target: Target, margin = 0.1): Target {
            let battle = ship.getBattle();
            if (battle) {
                // Keep out of arena borders
                let border = this.safety_distance * 0.5;
                target = target.keepInsideRectangle(border, border,
                    battle.width - border, battle.height - border,
                    ship.arena_x, ship.arena_y);

                // Apply collision prevention
                let ships = imaterialize(ifilter(battle.iships(true), s => s !== ship));
                ships = ships.sort((a, b) => cmp(a.getDistanceTo(ship), b.getDistanceTo(ship), true));
                ships.forEach(s => {
                    let new_target = target.moveOutOfCircle(s.arena_x, s.arena_y, this.safety_distance, ship.arena_x, ship.arena_y);
                    if (target != new_target && s.getDistanceTo(ship) < this.safety_distance) {
                        // Already inside the nearest ship's exclusion area
                        target = Target.newFromLocation(ship.arena_x, ship.arena_y);
                    } else {
                        target = new_target;
                    }
                });
            }
            return target;
        }

        /**
         * Apply reachable range, with remaining power
         */
        applyReachableRange(ship: Ship, target: Target, margin = 0.1): Target {
            let max_distance = this.getRangeRadius(ship);
            max_distance = Math.max(0, max_distance - margin);
            return target.constraintInRange(ship.arena_x, ship.arena_y, max_distance);
        }

        checkLocationTarget(ship: Ship, target: Target): Target | null {
            target = this.applyReachableRange(ship, target);
            target = this.applyExclusion(ship, target);
            return target.getDistanceTo(ship.location) > 0 ? target : null;
        }

        protected customApply(ship: Ship, target: Target) {
            ship.moveTo(target.x, target.y);
        }

        getEffectsDescription(): string {
            return `Move: ${this.distance_per_power}km per power point (safety: ${this.safety_distance}km)`;
        }
    }
}
