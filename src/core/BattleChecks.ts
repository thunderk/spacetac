module TK.SpaceTac {
    /**
     * List of checks to apply at the end of an action, to ensure a correct battle state
     * 
     * This is useful when the list of effects simulated by an action was missing something
     * 
     * To fix the state, new diffs will be applied
     */
    export class BattleChecks {
        constructor(private battle: Battle) {
        }

        /**
         * Apply all the checks
         */
        apply(): BaseBattleDiff[] {
            let all: BaseBattleDiff[] = [];
            let diffs: BaseBattleDiff[];
            let loops = 0;

            do {
                diffs = this.checkAll();

                if (diffs.length > 0) {
                    //console.log("Battle checks diffs", diffs);
                    this.battle.applyDiffs(diffs);
                    all = all.concat(diffs);
                }

                loops += 1;
                if (loops >= 1000) {
                    console.error("Battle checks stuck in infinite loop", diffs);
                    break;
                }
            } while (diffs.length > 0);

            return all;
        }

        /**
         * Get a list of diffs to apply to fix the battle state
         * 
         * This may not contain ALL the diffs needed, and should be called again while it returns diffs.
         */
        checkAll(): BaseBattleDiff[] {
            let diffs: BaseBattleDiff[] = [];

            if (this.battle.ended) {
                return diffs;
            }

            diffs = this.checkAreaEffects();
            if (diffs.length) {
                return diffs;
            }

            diffs = this.checkShipValues();
            if (diffs.length) {
                return diffs;
            }

            diffs = this.checkDeadShips();
            if (diffs.length) {
                return diffs;
            }

            diffs = this.checkVictory();
            if (diffs.length) {
                return diffs;
            }

            return [];
        }

        /**
         * Checks victory conditions, to put an end to the battle
         */
        checkVictory(): BaseBattleDiff[] {
            if (this.battle.ended) {
                return [];
            }

            let fleets = this.battle.fleets;
            if (any(fleets, fleet => !fleet.isAlive())) {
                const winner = first(fleets, fleet => fleet.isAlive());
                return [new EndBattleDiff(winner, this.battle.cycle)];
            } else {
                return [];
            }
        }

        /**
         * Check that ship values stays in their allowed range
         */
        checkShipValues(): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [];

            iforeach(this.battle.iships(true), ship => {
                keys(SHIP_VALUES).forEach(valuename => {
                    let value = ship.getValue(valuename);
                    if (value < 0) {
                        result.push(new ShipValueDiff(ship, valuename, -value));
                    } else {
                        let maximum = ship.getAttribute(<any>(valuename + "_capacity"));
                        if (value > maximum) {
                            result.push(new ShipValueDiff(ship, valuename, maximum - value));
                        }
                    }
                });
            });

            return result;
        }

        /**
         * Check that not-playing ships with no more hull are dead
         */
        checkDeadShips(): BaseBattleDiff[] {
            // We do one ship at a time, because the state of one ship may depend on another
            let dying = ifirst(this.battle.iships(true), ship => !ship.playing && ship.getValue("hull") <= 0);

            if (dying) {
                return dying.getDeathDiffs(this.battle);
            } else {
                return [];
            }
        }

        /**
         * Get the diffs to apply to a ship, if moving at a given location
         */
        getAreaEffectsDiff(ship: Ship): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [];
            let expected = this.battle.getAreaEffects(ship);
            let expected_hash = new RObjectContainer(expected.map(x => x[1]));

            // Remove obsolete effects
            ship.active_effects.list().forEach(effect => {
                if (!(effect instanceof StickyEffect) && !expected_hash.get(effect.id)) {
                    result.push(new ShipEffectRemovedDiff(ship, effect));
                    result = result.concat(effect.getOffDiffs(ship));
                }
            });

            // Add missing effects
            expected.forEach(([source, effect]) => {
                if (!ship.active_effects.get(effect.id)) {
                    result.push(new ShipEffectAddedDiff(ship, effect));
                    result = result.concat(effect.getOnDiffs(ship, source));
                }
            });

            return result;
        }

        /**
         * Check area effects (remove obsolete ones, and add missing ones)
         */
        checkAreaEffects(): BaseBattleDiff[] {
            let ships = imaterialize(this.battle.iships(true));
            return flatten(ships.map(ship => this.getAreaEffectsDiff(ship)));
        }
    }
}
