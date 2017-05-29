module TS.SpaceTac {
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
        processLog(log: BattleLog, attacker: Fleet) {
            this.stats = {};

            log.events.forEach(event => {
                if (event instanceof DamageEvent) {
                    this.addStat("Damage dealt", event.hull + event.shield, event.ship.fleet !== attacker);
                } else if (event instanceof MoveEvent) {
                    this.addStat("Move distance (km)", event.distance, event.ship.fleet === attacker);
                } else if (event instanceof DroneDeployedEvent) {
                    this.addStat("Drones deployed", 1, event.ship.fleet === attacker);
                }
            });
        }
    }
}
