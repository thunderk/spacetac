module TK.SpaceTac {
    /**
     * Get a list of all playable actions (like the actionbar for player) for a ship
     */
    function getPlayableActions(ship: Ship): Iterable<BaseAction> {
        let actions = ship.actions.listAll();
        return ifilter(iarray(actions), action => !action.checkCannotBeApplied(ship));
    }

    /**
     * Get the proportional effect done to a ship's health (in -1,1 range)
     */
    function getProportionalHealth(maneuver: Maneuver, ship: Ship): number {
        let chull = ship.getAttribute("hull_capacity");
        let cshield = ship.getAttribute("shield_capacity");
        let hull = ship.getValue("hull")
        let shield = ship.getValue("shield");
        let dhull = 0;
        let dshield = 0;

        maneuver.effects.forEach(diff => {
            if (diff instanceof ShipValueDiff) {
                if (ship.is(diff.ship_id)) {
                    if (diff.code == "hull") {
                        dhull += clamp(hull + diff.diff, 0, chull) - hull;
                    } else if (diff.code == "shield") {
                        dshield += clamp(shield + diff.diff, 0, cshield) - shield;
                    }
                }
            }
        });

        if (hull + dhull <= 0) {
            return -1;
        } else {
            let diff = dhull + dshield;
            return clamp(diff / (hull + shield), -1, 1);
        }
    }

    /**
     * Standard producers and evaluators for TacticalAI
     * 
     * These are static methods that may be used as base for TacticalAI ruleset.
     */
    export class TacticalAIHelpers {
        /**
         * Iterator of a list of "random" arena coordinates, based on a grid
         */
        static scanArena(battle: Battle, cells = 10, random = RandomGenerator.global): Iterable<Target> {
            return imap(irange(cells * cells), cellpos => {
                let y = Math.floor(cellpos / cells);
                let x = cellpos - y * cells;
                return Target.newFromLocation((x + random.random()) * battle.width / cells, (y + random.random()) * battle.height / cells);
            });
        }

        /**
         * Produce a turn end.
         */
        static produceEndTurn(ship: Ship, battle: Battle): TacticalProducer {
            return isingle(new Maneuver(ship, EndTurnAction.SINGLETON, Target.newFromShip(ship)));
        }

        /**
         * Produce all "direct hit" weapon shots.
         */
        static produceDirectShots(ship: Ship, battle: Battle): TacticalProducer {
            let enemies = battle.ienemies(ship, true);
            let weapons = ifilter(getPlayableActions(ship), action => action instanceof TriggerAction);
            return imap(icombine(enemies, weapons), ([enemy, weapon]) => new Maneuver(ship, weapon, Target.newFromShip(enemy)));
        }

        /**
         * Produce random moves inside arena cell
         */
        static produceRandomMoves(ship: Ship, battle: Battle, cells = 10, iterations = 1, random = RandomGenerator.global): TacticalProducer {
            let engines = ifilter(getPlayableActions(ship), action => action instanceof MoveAction);
            return ichainit(imap(irange(iterations), iteration => {
                let moves = icombine(engines, TacticalAIHelpers.scanArena(battle, cells, random));
                return imap(moves, ([engine, target]) => new Maneuver(ship, engine, target));
            }));
        }

        /**
         * Produce blast weapon shots, with multiple targets.
         */
        static produceInterestingBlastShots(ship: Ship, battle: Battle): TacticalProducer {
            // TODO Work with groups of 3, 4 ...
            let weapons = ifilter(ifilterclass(getPlayableActions(ship), TriggerAction), action => action.blast > 0);
            let enemies = battle.ienemies(ship, true);
            // TODO This produces duplicates (x, y) and (y, x)
            let couples = ifilter(icombine(enemies, enemies), ([e1, e2]) => e1 != e2);
            let candidates = ifilter(icombine(weapons, couples), ([weapon, [e1, e2]]) => Target.newFromShip(e1).getDistanceTo(Target.newFromShip(e2)) < weapon.blast * 2);
            let result = imap(candidates, ([weapon, [e1, e2]]) => new Maneuver(ship, weapon, Target.newFromLocation((e1.arena_x + e2.arena_x) / 2, (e1.arena_y + e2.arena_y) / 2)));
            return result;
        }

        /**
         * Produce random blast weapon shots, on a grid.
         */
        static produceRandomBlastShots(ship: Ship, battle: Battle): TacticalProducer {
            let weapons = ifilter(getPlayableActions(ship), action => action instanceof TriggerAction && action.blast > 0);
            let candidates = ifilter(icombine(weapons, TacticalAIHelpers.scanArena(battle)), ([weapon, location]) => (<TriggerAction>weapon).getEffects(ship, location).length > 0);
            let result = imap(candidates, ([weapon, location]) => new Maneuver(ship, weapon, location));
            return result;
        }

        /**
         * Produce interesting then random blast shots
         */
        static produceBlastShots(ship: Ship, battle: Battle): TacticalProducer {
            return ichain(TacticalAIHelpers.produceInterestingBlastShots(ship, battle), TacticalAIHelpers.produceRandomBlastShots(ship, battle));
        }

        /**
         * Produce toggle actions at random locations.
         */
        static produceToggleActions(ship: Ship, battle: Battle): TacticalProducer {
            let toggles = ifilter(getPlayableActions(ship), action => action instanceof ToggleAction);

            let self_toggles = ifilter(toggles, toggle => contains([ActionTargettingMode.SELF_CONFIRM, ActionTargettingMode.SELF], toggle.getTargettingMode(ship)));
            let self_maneuvers = imap(self_toggles, toggle => new Maneuver(ship, toggle, Target.newFromShip(ship)));

            let distant_toggles = ifilter(toggles, toggle => contains([ActionTargettingMode.SPACE, ActionTargettingMode.SURROUNDINGS], toggle.getTargettingMode(ship)));
            let grid = TacticalAIHelpers.scanArena(battle);
            let distant_maneuvers = imap(icombine(grid, distant_toggles), ([location, toggle]) => new Maneuver(ship, toggle, location));

            return ichain(self_maneuvers, distant_maneuvers);
        }

        /**
         * Evaluate the number of turns necessary for the maneuver, between -1 and 1
         */
        static evaluateTurnCost(ship: Ship, battle: Battle, maneuver: Maneuver): number {
            let powerusage = maneuver.simulation.total_move_ap + maneuver.simulation.total_fire_ap;
            if (powerusage == 0) {
                return -1;
            } else if (maneuver.simulation.total_fire_ap > ship.getAttribute("power_capacity")) {
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
            let power_capacity = ship.getAttribute("power_capacity") || 1;

            if (maneuver.action instanceof EndTurnAction) {
                return -ship.getValue("power") / power_capacity;
            } else if (maneuver.action instanceof TriggerAction) {
                return 0.5;
            } else if (maneuver.action instanceof ToggleAction) {
                return ship.actions.isToggled(maneuver.action) ? -0.2 : 0.5;
            } else if (maneuver.action instanceof MoveAction) {
                return -(ship.getValue("power") - maneuver.getPowerUsage()) / power_capacity;
            } else {
                return 0;
            }
        }

        /**
         * Evaluate the effect on health for a group of ships
         */
        static evaluateHealthEffect(maneuver: Maneuver, ships: Ship[]): number {
            if (ships.length) {
                let diffs = ships.map(ship => getProportionalHealth(maneuver, ship));
                let deaths = sum(diffs.map(i => i == -1 ? 1 : 0));
                return ((sum(diffs) * 0.5) - (deaths * 0.5)) / ships.length;
            } else {
                return 0;
            }
        }

        /**
         * Evaluate the effect on health to the enemy, between -1 and 1
         */
        static evaluateEnemyHealth(ship: Ship, battle: Battle, maneuver: Maneuver): number {
            let enemies = imaterialize(battle.ienemies(ship, true));
            return -TacticalAIHelpers.evaluateHealthEffect(maneuver, enemies);
        }

        /**
         * Evaluate the effect on health to allied ships, between -1 and 1
         */
        static evaluateAllyHealth(ship: Ship, battle: Battle, maneuver: Maneuver): number {
            let allies = imaterialize(battle.iallies(ship, true));
            return TacticalAIHelpers.evaluateHealthEffect(maneuver, allies);
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

        /**
         * Evaluate the cost of overheating an equipment
         */
        static evaluateOverheat(ship: Ship, battle: Battle, maneuver: Maneuver): number {
            let cooldown = ship.actions.getCooldown(maneuver.action);
            if (cooldown.willOverheat()) {
                return -Math.min(1, 0.4 * cooldown.cooling);
            } else {
                return 0;
            }
        }

        /**
         * Evaluate the gain or loss of active effects
         */
        static evaluateActiveEffects(ship: Ship, battle: Battle, maneuver: Maneuver): number {
            let result = 0;
            maneuver.effects.forEach(effect => {
                if (effect instanceof ShipEffectAddedDiff || effect instanceof ShipEffectRemovedDiff) {
                    let target = battle.getShip(effect.ship_id);
                    let enemy = target && !target.isPlayedBy(ship.getPlayer());
                    let beneficial = effect.effect.isBeneficial();
                    if (effect instanceof ShipEffectRemovedDiff) {
                        beneficial = !beneficial;
                    }
                    // TODO Evaluate the "power" of the effect
                    if ((beneficial && !enemy) || (!beneficial && enemy)) {
                        result += 1;
                    } else {
                        result -= 1;
                    }
                }
            });
            return clamp(result / battle.ships.count(), -1, 1);
        }
    }
}