/// <reference path="AbstractAI.ts"/>
module TS.SpaceTac {
    // Combination of a move action and a fire action
    export class BullyManeuver {
        // Move action to position the ship before firing
        move: Maneuver;

        // Fire action
        fire: Maneuver;

        constructor(move: Maneuver = null, fire: Maneuver = null) {
            this.move = move;
            this.fire = fire;
        }

        // Get a sorting score, by distance to another point
        //   Nearest means higher score
        getScoreByDistance(point: Target): number {
            return -point.getDistanceTo(this.fire.target);
        }
    }

    // Basic Artificial Intelligence, with a tendency to move forward and shoot the nearest enemy
    export class BullyAI extends AbstractAI {
        // Safety margin in moves to account for floating-point rounding errors
        move_margin: number;

        constructor(fleet: Fleet) {
            super(fleet);

            this.move_margin = 0.1;
        }

        protected initWork(): void {
            this.addWorkItem(() => {
                var maneuvers = this.listAllManeuvers();
                var maneuver: BullyManeuver;

                if (maneuvers.length > 0) {
                    maneuver = this.pickManeuver(maneuvers);
                    this.applyManeuver(maneuver);

                    // Try to make another maneuver
                    this.initWork();
                } else {
                    // No bullying available, going to fallback move
                    maneuver = this.getFallbackManeuver();
                    this.applyManeuver(maneuver);
                }
            });
        }

        // List all enemy ships that can be a target
        listAllEnemies(): Ship[] {
            var result: Ship[] = [];

            this.fleet.battle.play_order.forEach((ship: Ship) => {
                if (ship.alive && ship.getPlayer() !== this.ship.getPlayer()) {
                    result.push(ship);
                }
            });

            return result;
        }

        // List all weapons
        listAllWeapons(): Equipment[] {
            return this.ship.listEquipment(SlotType.Weapon);
        }

        // List all available maneuvers for the playing ship
        listAllManeuvers(): BullyManeuver[] {
            var result: BullyManeuver[] = [];

            var enemies = this.listAllEnemies();
            var weapons = this.listAllWeapons();

            enemies.forEach((ship: Ship) => {
                weapons.forEach((weapon: Equipment) => {
                    var maneuver = this.checkBullyManeuver(ship, weapon);
                    if (maneuver) {
                        result.push(maneuver);
                    }
                });
            });

            return result;
        }

        // Get an equipped engine to make a move
        getEngine(): Equipment {
            var engines = this.ship.listEquipment(SlotType.Engine);
            if (engines.length === 0) {
                return null;
            } else {
                return engines[0];
            }
        }

        // Check if a weapon can be used against an enemy
        //   Returns the BullyManeuver, or null if impossible to fire
        checkBullyManeuver(enemy: Ship, weapon: Equipment): BullyManeuver {
            // Check if enemy in range
            var target = Target.newFromShip(enemy);
            var distance = target.getDistanceTo(Target.newFromShip(this.ship));
            var move: Target;
            var engine: Equipment;
            var remaining_ap = this.ship.values.power.get();
            if (distance <= weapon.distance) {
                // No need to move
                move = null;
            } else {
                // Move to be in range, using first engine
                engine = this.getEngine();
                if (!engine) {
                    // No engine available to move
                    return null;
                } else {
                    var move_distance = distance - weapon.distance + this.move_margin;
                    var move_ap = engine.ap_usage * move_distance / engine.distance;
                    if (move_ap > remaining_ap) {
                        // Not enough AP to move in range
                        return null;
                    } else {
                        move = target.constraintInRange(this.ship.arena_x, this.ship.arena_y, move_distance);
                        remaining_ap -= move_ap;
                    }
                }
            }

            // Check fire
            if (weapon.ap_usage > remaining_ap) {
                // Not enough AP to fire
                return null;
            } else {
                var result = new BullyManeuver();
                if (move) {
                    result.move = new Maneuver(this.ship, engine, move);
                }
                result.fire = new Maneuver(this.ship, weapon, target);
                return result;
            }
        }

        // When no bully action is available, pick a random enemy, and go towards it
        getFallbackManeuver(): BullyManeuver {
            var enemies = this.listAllEnemies();
            if (enemies.length === 0) {
                return null;
            }

            var APPROACH_FACTOR = 0.5;

            var picked = this.random.choice(enemies);
            var target = Target.newFromShip(picked);
            var distance = target.getDistanceTo(Target.newFromShip(this.ship));
            var engine = this.getEngine();
            var safety_distance = (<MoveAction>engine.action).safety_distance;
            if (distance > safety_distance) { // Don't move too close
                target = target.constraintInRange(this.ship.arena_x, this.ship.arena_y,
                    (distance - safety_distance) * APPROACH_FACTOR);
                target = engine.action.checkLocationTarget(this.fleet.battle, this.ship, target);
                return new BullyManeuver(new Maneuver(this.ship, engine, target));
            } else {
                return null;
            }
        }

        // Pick a maneuver from a list of available ones
        //  By default, it chooses the nearest enemy
        pickManeuver(available: BullyManeuver[]): BullyManeuver {
            if (available.length === 0) {
                return null;
            }

            // Sort by descending score
            available.sort((m1: BullyManeuver, m2: BullyManeuver): number => {
                var point = Target.newFromShip(this.ship);
                return m1.getScoreByDistance(point) < m2.getScoreByDistance(point) ? 1 : -1;
            });
            return available[0];
        }

        // Effectively apply the chosen maneuver
        applyManeuver(maneuver: BullyManeuver): void {
            if (maneuver.move) {
                this.addWorkItem(() => {
                    maneuver.move.apply();
                }, 500);
            }

            if (maneuver.fire) {
                this.addWorkItem(() => {
                    maneuver.fire.apply();
                }, 1500);
            }

            this.addWorkItem(null, 1500);
        }
    }
}
