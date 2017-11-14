module TK.SpaceTac {
    /**
     * List of checks to apply at the end of an action, to ensure a correct battle state
     * 
     * This is useful when the list of effects simulated by an action was missing something
     * 
     * To fix the state, new diffs will be applied
     */
    export class BattleChecks {
        private battle: Battle;
        constructor(battle: Battle) {
            this.battle = battle;
        }

        /**
         * Apply all the checks
         */
        apply(): void {
            let diffs: BaseBattleDiff[];
            let loops = 0;

            do {
                diffs = this.checkAll();

                if (diffs.length > 0) {
                    this.battle.applyDiffs(diffs);
                }

                loops += 1;
                if (loops >= 1000) {
                    console.error("Battle checks locked in infinite loop", diffs);
                    break;
                }
            } while (diffs.length > 0);
        }

        /**
         * Get a list of diffs to apply to fix the battle state
         * 
         * This may not contain ALL the diffs needed, and should be called again while it returns diffs.
         */
        checkAll(): BaseBattleDiff[] {
            let diffs = this.checkVictory();
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
         * Check that ship with no more hull are dead
         */
        checkDeadShips(): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [];

            iforeach(this.battle.iships(true), ship => {
                if (ship.getValue("hull") == 0) {
                    result.push(new ShipDeathDiff(this.battle, ship));
                }
            });

            return result;
        }
    }
}
