module TS.SpaceTac {
    /**
     * Helper for working with exclusion areas (areas where a ship cannot go)
     * 
     * There are three types of exclusion:
     * - Hard border exclusion, that prevents a ship from being too close to the battle edges
     * - Hard obstacle exclusion, that prevents two ships from being too close to each other
     * - Soft obstacle exclusion, usually associated with an engine, that prevents a ship from moving too close to others
     */
    export class ExclusionAreas {
        xmin: number
        xmax: number
        ymin: number
        ymax: number
        active: boolean
        hard_border = 50
        hard_obstacle = 100
        effective_obstacle = this.hard_obstacle
        obstacles: ArenaLocation[] = []

        constructor(width: number, height: number) {
            this.xmin = 0;
            this.xmax = width - 1;
            this.ymin = 0;
            this.ymax = height - 1;
            this.active = width > 0 && height > 0;
        }

        /**
         * Build an exclusion helper from a battle.
         */
        static fromBattle(battle: Battle, ignore_ships: Ship[] = [], soft_distance = 0): ExclusionAreas {
            let result = new ExclusionAreas(battle.width, battle.height);
            result.hard_border = battle.border;
            result.hard_obstacle = battle.ship_separation;
            let obstacles = imap(ifilter(battle.iships(), ship => !contains(ignore_ships, ship)), ship => ship.location);
            result.configure(imaterialize(obstacles), soft_distance);
            return result;
        }

        /**
         * Build an exclusion helper for a ship.
         * 
         * If *ignore_self* is True, the ship will itself not be included in exclusion areas.
         */
        static fromShip(ship: Ship, soft_distance = 0, ignore_self = true): ExclusionAreas {
            let battle = ship.getBattle();
            if (battle) {
                return ExclusionAreas.fromBattle(battle, ignore_self ? [ship] : [], soft_distance);
            } else {
                return new ExclusionAreas(0, 0);
            }
        }

        /**
         * Configure the areas for next check calls.
         */
        configure(obstacles: ArenaLocation[], soft_distance: number) {
            this.obstacles = obstacles;
            this.effective_obstacle = Math.max(soft_distance, this.hard_obstacle);
        }

        /**
         * Keep a location outside exclusion areas, when coming from a source.
         * 
         * It will return the furthest location on the [source, location] segment, that is not inside an exclusion
         * area.
         */
        stopBefore(location: ArenaLocation, source: ArenaLocation): ArenaLocation {
            if (!this.active) {
                return location;
            }

            let target = Target.newFromLocation(location.x, location.y);

            // Keep out of arena borders
            target = target.keepInsideRectangle(this.xmin + this.hard_border, this.ymin + this.hard_border,
                this.xmax - this.hard_border, this.ymax - this.hard_border,
                source.x, source.y);

            // Apply collision prevention
            let obstacles = sorted(this.obstacles, (a, b) => cmp(arenaDistance(a, source), arenaDistance(b, source), true));
            obstacles.forEach(s => {
                let new_target = target.moveOutOfCircle(s.x, s.y, this.effective_obstacle, source.x, source.y);
                if (target != new_target && arenaDistance(s, source) < this.effective_obstacle) {
                    // Already inside the nearest ship's exclusion area
                    target = Target.newFromLocation(source.x, source.y);
                } else {
                    target = new_target;
                }
            });

            return new ArenaLocation(target.x, target.y);
        }
    }
}
