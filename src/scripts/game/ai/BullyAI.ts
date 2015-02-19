/// <reference path="AbstractAI.ts"/>
module SpaceTac.Game.AI {
    "use strict";

    export class BullyMove {
        // Position to move to, before firing
        move_to: Target;

        // Engine used to move
        engine: Equipment;

        // Weapon to use
        weapon: Equipment;

        // Ship to target
        target: Ship;

        // Get a sorting score, by distance to another point
        //   Nearest means higher score
        getScoreByDistance(point: Target): number {
            return -point.getDistanceTo(Target.newFromShip(this.target));
        }
    }

    // Basic Artificial Intelligence, with a tendency to move forward and shoot the nearest enemy
    export class BullyAI extends AbstractAI {
        constructor(fleet: Fleet) {
            super(fleet);
        }

        protected initWork(): void {
            this.addWorkItem(() => {
                var moves = this.listAllMoves();

                if (moves.length > 0) {
                    var move = this.pickMove(moves);
                    this.applyMove(move);

                    // Try to make another move
                    this.initWork();
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

        // List all available "moves" for the playing ship
        listAllMoves(): BullyMove[] {
            var result: BullyMove[] = [];

            var enemies = this.listAllEnemies();
            var weapons = this.listAllWeapons();

            enemies.forEach((ship: Ship) => {
                weapons.forEach((weapon: Equipment) => {
                    var move = this.checkBullyMove(ship, weapon);
                    if (move) {
                        result.push(move);
                    }
                });
            });

            return result;
        }

        // Check if a weapon can be used against an enemy
        //   Returns the BullyMove, or null if impossible to fire
        checkBullyMove(enemy: Ship, weapon: Equipment): BullyMove {
            // Check if enemy in range
            var target = Target.newFromShip(enemy);
            var distance = target.getDistanceTo(Target.newFromShip(this.ship));
            var move: Target;
            var engine: Equipment;
            var remaining_ap = this.ship.ap_current.current;
            if (distance <= weapon.distance) {
                // No need to move
                move = null;
            } else {
                // Move to be in range, using first engine
                var engines = this.ship.listEquipment(SlotType.Engine);
                if (engines.length === 0) {
                    // No engine available to move
                    return null;
                } else {
                    engine = engines[0];
                    var move_distance = distance - weapon.distance;
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
                var result = new BullyMove();
                result.move_to = move;
                result.engine = engine;
                result.target = enemy;
                result.weapon = weapon;
                return result;
            }
        }

        // Pick a move from a list of available ones
        //  By default, it chooses the nearest enemy
        pickMove(available: BullyMove[]): BullyMove {
            if (available.length === 0) {
                return null;
            }

            // Sort by descending score
            available.sort((m1: BullyMove, m2: BullyMove): number => {
                var point = Target.newFromShip(this.ship);
                return m1.getScoreByDistance(point) < m2.getScoreByDistance(point) ? 1 : -1;
            });
            return available[0];
        }

        // Effectively apply the chosen move
        applyMove(move: BullyMove): void {
            if (move.move_to) {
                this.addWorkItem(() => {
                    move.engine.action.apply(this.battle, this.ship, move.move_to);
                }, 1000);
            }

            this.addWorkItem(() => {
                move.weapon.action.apply(this.fleet.battle, this.ship, Target.newFromShip(move.target));
            }, 1500);

            this.addWorkItem(null, 500);
        }
    }
}
