module TS.SpaceTac {
    /**
     * Iterator of a list of "random" arena coordinates, based on a grid
     */
    function scanArena(battle: Battle, cells = 10, random = RandomGenerator.global): Iterator<Target> {
        return imap(irange(cells * cells), cellpos => {
            let y = Math.floor(cellpos / cells);
            let x = cellpos - y * cells;
            return Target.newFromLocation((x + random.random()) * battle.width / cells, (y + random.random()) * battle.height / cells);
        });
    }

    /**
     * Get a list of all playable actions (like the actionbar for player) for a ship
     */
    function getPlayableActions(ship: Ship): Iterator<BaseAction> {
        let actions = ship.getAvailableActions();
        return ifilter(iarray(actions), action => !action.checkCannotBeApplied(ship));
    }

    /**
     * Standard producers and evaluators for TacticalAI
     * 
     * These are static methods that may be used as base for TacticalAI ruleset.
     */
    export class TacticalAIHelpers {
        /**
         * Produce a turn end.
         */
        static produceEndTurn(ship: Ship, battle: Battle): TacticalProducer {
            return isingle(new Maneuver(ship, new EndTurnAction(), Target.newFromShip(ship)));
        }

        /**
         * Produce all "direct hit" weapon shots.
         */
        static produceDirectShots(ship: Ship, battle: Battle): TacticalProducer {
            let enemies = ifilter(battle.iships(), iship => iship.alive && iship.getPlayer() !== ship.getPlayer());
            let weapons = ifilter(getPlayableActions(ship), action => action instanceof FireWeaponAction);
            return imap(icombine(enemies, weapons), ([enemy, weapon]) => new Maneuver(ship, weapon, Target.newFromShip(enemy)));
        }

        /**
         * Produce random moves inside arena cell
         */
        static produceRandomMoves(ship: Ship, battle: Battle, cells = 10, iterations = 1, random = RandomGenerator.global): TacticalProducer {
            let engines = ifilter(getPlayableActions(ship), action => action instanceof MoveAction);
            return ichainit(imap(irange(iterations), iteration => {
                let moves = icombine(engines, scanArena(battle, cells, random));
                return imap(moves, ([engine, target]) => new Maneuver(ship, engine, target));
            }));
        }

        /**
         * Produce blast weapon shots, with multiple targets.
         */
        static produceBlastShots(ship: Ship, battle: Battle): TacticalProducer {
            // TODO Work with groups of 3, 4 ...
            let weapons = ifilter(getPlayableActions(ship), action => action instanceof FireWeaponAction && action.blast > 0);
            let enemies = battle.ienemies(ship.getPlayer(), true);
            // FIXME This produces duplicates (x, y) and (y, x)
            let couples = ifilter(icombine(enemies, enemies), ([e1, e2]) => e1 != e2);
            let candidates = ifilter(icombine(weapons, couples), ([weapon, [e1, e2]]) => Target.newFromShip(e1).getDistanceTo(Target.newFromShip(e2)) < weapon.getBlastRadius(ship) * 2);
            let result = imap(candidates, ([weapon, [e1, e2]]) => new Maneuver(ship, weapon, Target.newFromLocation((e1.arena_x + e2.arena_x) / 2, (e1.arena_y + e2.arena_y) / 2)));
            return result;
        }

        /**
         * Produce drone deployments.
         */
        static produceDroneDeployments(ship: Ship, battle: Battle): TacticalProducer {
            let drones = ifilter(getPlayableActions(ship), action => action instanceof DeployDroneAction);
            let grid = scanArena(battle);
            return imap(icombine(grid, drones), ([target, drone]) => new Maneuver(ship, drone, target));
        }

        /**
         * Evaluate the number of turns necessary for the maneuver, between -1 and 1
         */
        static evaluateTurnCost(ship: Ship, battle: Battle, maneuver: Maneuver): number {
            let powerusage = maneuver.simulation.total_move_ap + maneuver.simulation.total_fire_ap;
            if (maneuver.simulation.total_fire_ap > ship.getAttribute("power_capacity")) {
                return -Infinity;
            } else if (powerusage > ship.getValue("power")) {
                return -1;
            } else {
                return (ship.getValue("power") - powerusage) / ship.getAttribute("power_capacity");
            }
        }

        /**
         * Evaluate doing nothing, between -1 and 1
         */
        static evaluateIdling(ship: Ship, battle: Battle, maneuver: Maneuver): number {
            let lost = ship.getValue("power") - maneuver.getPowerUsage() + ship.getAttribute("power_recovery") - ship.getAttribute("power_capacity");
            if (lost > 0) {
                return -lost / ship.getAttribute("power_capacity");
            } else if (maneuver.simulation.need_fire) {
                return 0.5;
            } else {
                return 0;
            }
        }

        /**
         * Evaluate the damage done to the enemy, between -1 and 1
         */
        static evaluateDamageToEnemy(ship: Ship, battle: Battle, maneuver: Maneuver): number {
            let action = maneuver.action;
            if (action instanceof FireWeaponAction) {
                let enemies = imaterialize(battle.ienemies(ship.getPlayer(), true));
                if (enemies.length == 0) {
                    return 0;
                }
                let damage = 0;
                let dead = 0;
                let effects = action.getEffects(ship, maneuver.target);
                effects.forEach(([ship, effect]) => {
                    if (effect instanceof DamageEffect && contains(enemies, ship)) {
                        let [shield, hull] = effect.getEffectiveDamage(ship);
                        damage += shield + hull;
                        if (hull == ship.getValue("hull")) {
                            dead += 1
                        }
                    }
                });
                let hp = sum(enemies.map(enemy => enemy.getValue("hull") + enemy.getValue("shield")));
                let result = (damage ? 0.2 : 0) + 0.3 * (damage / hp) + (dead ? 0.2 : 0) + 0.3 * (dead / enemies.length);
                return result;
            } else {
                return 0;
            }
        }

        /**
         * Evaluate the clustering of ships, between -1 and 1
         */
        static evaluateClustering(ship: Ship, battle: Battle, maneuver: Maneuver): number {
            // TODO Take into account blast radius of in-play weapons
            let move_location = maneuver.getFinalLocation();
            let distances = imaterialize(imap(ifilter(battle.iships(), iship => iship != ship), iship => Target.newFromShip(iship).getDistanceTo(move_location)));
            if (distances.length == 0) {
                return 0;
            } else {
                let factor = max([battle.width, battle.height]) * 0.01;
                let result = -clamp(sum(distances.map(distance => factor / distance)), 0, 1);
                return result;
            }
        }

        /**
         * Evaluate the global positioning of a ship on the arena, between -1 and 1
         */
        static evaluatePosition(ship: Ship, battle: Battle, maneuver: Maneuver): number {
            let pos = maneuver.getFinalLocation();
            let distance = min([pos.x, pos.y, battle.width - pos.x, battle.height - pos.y]);
            let factor = min([battle.width / 2, battle.height / 2]);
            return -1 + 2 * distance / factor;
        }
    }
}