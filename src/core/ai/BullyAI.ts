/// <reference path="AbstractAI.ts"/>
/// <reference path="Maneuver.ts"/>
module TS.SpaceTac {
    export class BullyManeuver extends Maneuver {
        // Get a sorting score, by distance to another point
        //   Nearest means higher score
        getScoreByDistance(point: Target): number {
            return -point.getDistanceTo(this.simulation.fire_location);
        }
    }

    // Basic Artificial Intelligence, with a tendency to move forward and shoot the nearest enemy
    export class BullyAI extends AbstractAI {
        // Safety margin in moves to account for floating-point rounding errors
        move_margin = 0.1;

        protected initWork(): void {
            if (this.ship.getValue("power") > 0) {
                this.addWorkItem(() => {
                    var maneuvers = this.listAllManeuvers();
                    var maneuver: BullyManeuver | null;

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
        }

        // List all enemy ships that can be a target
        listAllEnemies(): Ship[] {
            var result: Ship[] = [];

            let battle = this.ship.getBattle();
            if (battle) {
                battle.play_order.forEach((ship: Ship) => {
                    if (ship.alive && ship.getPlayer() !== this.ship.getPlayer()) {
                        result.push(ship);
                    }
                });
            }

            return result;
        }

        // List all weapons
        listAllWeapons(): Equipment[] {
            return this.ship.listEquipment(SlotType.Weapon).filter(equipement => any(equipement.target_effects, effect => effect instanceof DamageEffect));
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
        getEngine(): Equipment | null {
            var engines = this.ship.listEquipment(SlotType.Engine);
            if (engines.length === 0) {
                return null;
            } else {
                return engines[0];
            }
        }

        // Check if a weapon can be used against an enemy
        //   Returns the BullyManeuver, or null if impossible to fire
        checkBullyManeuver(enemy: Ship, weapon: Equipment): BullyManeuver | null {
            let maneuver = new BullyManeuver(this.ship, weapon, Target.newFromShip(enemy), this.move_margin);
            // TODO In case of blast weapon, check that this would be a hit !
            if (maneuver.simulation.can_fire) {
                return maneuver;
            } else {
                return null;
            }
        }

        // When no bully action is available, pick a random enemy, and go towards it
        getFallbackManeuver(): BullyManeuver | null {
            var enemies = this.listAllEnemies();
            if (enemies.length === 0) {
                return null;
            }

            var APPROACH_FACTOR = 0.5;

            var picked = this.random.choice(enemies);
            var target = Target.newFromShip(picked);
            var distance = target.getDistanceTo(Target.newFromShip(this.ship));
            var engine = this.getEngine();
            if (engine) {
                var safety_distance = (<MoveAction>engine.action).safety_distance;
                if (distance > safety_distance) { // Don't move too close
                    target = target.constraintInRange(this.ship.arena_x, this.ship.arena_y,
                        (distance - safety_distance) * APPROACH_FACTOR);
                    let loctarget = engine.action.checkLocationTarget(this.ship, target);
                    if (loctarget) {
                        return new BullyManeuver(this.ship, engine, loctarget);
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }

        // Pick a maneuver from a list of available ones
        //  By default, it chooses the nearest enemy
        pickManeuver(available: BullyManeuver[]): BullyManeuver | null {
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
        applyManeuver(maneuver: BullyManeuver | null): void {
            if (maneuver) {
                this.addWorkItem(() => {
                    maneuver.apply();
                }, 1500);
            }

            this.addWorkItem(null, 1500);
        }
    }
}
