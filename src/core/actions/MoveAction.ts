module TS.SpaceTac {
    // Action to move to a given location
    export class MoveAction extends BaseAction {
        // Distance allowed for each power point (raw, without applying maneuvrability)
        distance_per_power: number

        // Safety distance from other ships
        safety_distance: number

        // Equipment cannot be null (engine)
        equipment: Equipment

        // Impact of maneuvrability (in % of distance)
        maneuvrability_factor: number

        constructor(equipment: Equipment, distance_per_power = 0, safety_distance = 120, maneuvrability_factor = 0) {
            super("move", "Move", true, equipment);

            this.distance_per_power = distance_per_power;
            this.safety_distance = safety_distance;
            this.maneuvrability_factor = maneuvrability_factor;
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
            return Math.ceil(distance / this.getDistanceByActionPoint(ship));
        }

        getRangeRadius(ship: Ship): number {
            return ship.getValue("power") * this.getDistanceByActionPoint(ship);
        }

        /**
         * Get the distance range that may be traveled with 1 action point
         */
        getDistanceRangeByActionPoint(): IntegerRange {
            let min_distance = Math.ceil(this.distance_per_power * (1 - this.maneuvrability_factor * 0.01));
            return new IntegerRange(min_distance, this.distance_per_power);
        }

        /**
         * Get the distance that may be traveled with 1 action point
         */
        getDistanceByActionPoint(ship: Ship): number {
            let maneuvrability = Math.max(ship.getAttribute("maneuvrability"), 0);
            let factor = maneuvrability / (maneuvrability + 2);
            let range = this.getDistanceRangeByActionPoint();
            return range.getProportional(factor);
        }

        /**
         * Get an exclusion helper for this move action
         */
        getExclusionAreas(ship: Ship): ExclusionAreas {
            return ExclusionAreas.fromShip(ship, this.safety_distance);
        }

        /**
         * Apply exclusion areas (neer arena borders, or other ships)
         */
        applyExclusion(ship: Ship, target: Target): Target {
            let exclusion = this.getExclusionAreas(ship);

            let destination = exclusion.stopBefore(new ArenaLocation(target.x, target.y), ship.location);
            target = Target.newFromLocation(destination.x, destination.y);
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
            ship.moveTo(target.x, target.y, this.equipment);
        }

        getEffectsDescription(): string {
            let range = this.getDistanceRangeByActionPoint();
            let rangeinfo = (range.max == range.min) ? `${range.min}` : `${range.min}-${range.max}`;
            let result = `Move: ${rangeinfo}km per power point`;

            if (this.safety_distance) {
                result += ` (safety: ${this.safety_distance}km)`;
            }

            return result;
        }
    }
}
