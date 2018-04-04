module TK.SpaceTac {
    /** 
     * Configuration of a trigger action
     */
    export interface MoveActionConfig {
        // Distance allowed for each power point (raw, without applying maneuvrability)
        distance_per_power: number
        // Safety distance from other ships
        safety_distance: number
    }

    /**
     * Action to move the ship to a specific location
     */
    export class MoveAction extends BaseAction implements MoveActionConfig {
        distance_per_power = 0
        safety_distance = 120
        maneuvrability_factor = 0

        constructor(name = "Engine", config?: Partial<MoveActionConfig>, code = "move") {
            super(name, code);

            if (config) {
                this.configureEngine(config);
            }
        }

        /** 
         * Configure the engine
         */
        configureEngine(config: Partial<MoveActionConfig>): void {
            copyfields(config, this);
        }

        getVerb(ship: Ship): string {
            return "Move";
        }

        getTitle(ship: Ship): string {
            return `Use ${this.name}`;
        }

        getTargettingMode(ship: Ship): ActionTargettingMode {
            return ActionTargettingMode.SPACE;
        }

        getDefaultTarget(ship: Ship): Target {
            return Target.newFromLocation(ship.arena_x + Math.cos(ship.arena_angle) * 100, ship.arena_y + Math.sin(ship.arena_angle) * 100);
        }

        checkCannotBeApplied(ship: Ship, remaining_ap: number | null = null): ActionUnavailability | null {
            let base = super.checkCannotBeApplied(ship, Infinity);
            if (base) {
                return base;
            }

            // Check AP usage
            if (remaining_ap === null) {
                remaining_ap = ship.getValue("power");
            }
            if (remaining_ap < 0.0001) {
                return ActionUnavailability.POWER;
            }

            // Check vigilance actions
            if (any(ship.getToggleActions(true), action => action instanceof VigilanceAction)) {
                return ActionUnavailability.VIGILANCE;
            }

            return null;
        }

        getPowerUsage(ship: Ship, target: Target | null): number {
            if (this.distance_per_power == 0) {
                return Infinity;
            } else if (target) {
                let distance = Target.newFromShip(ship).getDistanceTo(target);
                return Math.ceil(distance / this.distance_per_power);
            } else {
                return 0;
            }
        }

        getRangeRadius(ship: Ship): number {
            return this.getRangeRadiusForPower(ship);
        }

        /**
         * Get the distance reachable with a given power 
         */
        getRangeRadiusForPower(ship: Ship, power = ship.getValue("power")): number {
            return power * this.distance_per_power;
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

        protected getSpecificDiffs(ship: Ship, battle: Battle, target: Target): BaseBattleDiff[] {
            let angle = (arenaDistance(target, ship.location) < 0.00001) ? ship.arena_angle : arenaAngle(ship.location, target);
            let destination = new ArenaLocationAngle(target.x, target.y, angle);
            return [new ShipMoveDiff(ship, ship.location, destination, this)];
        }

        getEffectsDescription(): string {
            let result = `Move: ${this.distance_per_power}km per power point`;

            if (this.safety_distance) {
                result += ` (safety: ${this.safety_distance}km)`;
            }

            return result;
        }
    }
}
