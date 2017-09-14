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
        processLog(log: BattleLog, attacker: Fleet, clear = false) {
            if (clear) {
                this.stats = {};
            }

            log.events.forEach(event => {
                if (event instanceof ActionAppliedEvent) {
                    this.addStat("Power used", event.power, event.ship.fleet === attacker);
                } else if (event instanceof DamageEvent) {
                    this.addStat("Damage dealt", event.hull + event.shield, event.ship.fleet !== attacker);
                } else if (event instanceof MoveEvent) {
                    this.addStat("Move distance (km)", event.getDistance(), event.ship.fleet === attacker);
                } else if (event instanceof DroneDeployedEvent) {
                    this.addStat("Drones deployed", 1, event.ship.fleet === attacker);
                }
            });
        }

        /**
         * Get the raw value of a fleet
         */
        private getFleetValue(fleet: Fleet): number {
            return sum(fleet.ships.map(ship => {
                return sum(ship.listEquipment().map(equipment => equipment.getPrice()));
            }));
        }

        /**
         * Prepare some stats at the start of battle
         */
        onBattleStart(attacker: Fleet, defender: Fleet): void {
            this.addStat("Equipment wear (zotys)", this.getFleetValue(attacker), true);
            this.addStat("Equipment wear (zotys)", this.getFleetValue(defender), false);
        }

        /**
         * Finalize some stats at the start of battle
         */
        onBattleEnd(attacker: Fleet, defender: Fleet): void {
            this.addStat("Equipment wear (zotys)", -this.getFleetValue(attacker), true);
            this.addStat("Equipment wear (zotys)", -this.getFleetValue(defender), false);
        }
    }
}
