module TK.SpaceTac {
    /**
     * Statistics collection over a battle
     */
    export class BattleStats {
        stats: { [name: string]: [number, number] } = {}

        /**
         * Add a value to the collector
         */
        addStat(name: string, value: number, attacker: boolean) {
            if (!this.stats[name]) {
                this.stats[name] = [0, 0];
            }

            if (attacker) {
                this.stats[name] = [this.stats[name][0] + value, this.stats[name][1]];
            } else {
                this.stats[name] = [this.stats[name][0], this.stats[name][1] + value];
            }
        }

        /**
         * Get important stats
         */
        getImportant(maxcount: number): { name: string, attacker: number, defender: number }[] {
            // TODO Sort by importance
            let result: { name: string, attacker: number, defender: number }[] = [];
            iteritems(this.stats, (name, [attacker, defender]) => {
                if (result.length < maxcount) {
                    result.push({ name: name, attacker: Math.round(attacker), defender: Math.round(defender) });
                }
            });
            return result;
        }

        /**
         * Process a battle log
         */
        processLog(log: BattleLog, attacker: Fleet, clear = false) {
            if (clear) {
                this.stats = {};
            }

            let n = log.count();
            for (let i = 0; i < n; i++) {
                let diff = log.get(i);
                if (diff instanceof BaseBattleShipDiff) {
                    let diff_ship = diff.ship_id;
                    let attacker_ship = any(attacker.ships, ship => ship.is(diff_ship));
                    if (diff instanceof ShipDamageDiff) {
                        this.addStat("Damage dealt", diff.hull + diff.shield, !attacker_ship);
                    } else if (diff instanceof ShipMoveDiff) {
                        this.addStat("Move distance (km)", diff.getDistance(), attacker_ship);
                    } else if (diff instanceof DroneDeployedDiff) {
                        this.addStat("Drones deployed", 1, attacker_ship);
                    }
                }
            }
        }
    }
}
