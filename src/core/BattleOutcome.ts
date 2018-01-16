module TK.SpaceTac {
    /**
     * Result of an ended battle
     * 
     * This stores the winner, and the retrievable loot
     */
    export class BattleOutcome {
        // Indicates if the battle is a draw (no winner)
        draw: boolean;

        // Victorious fleet
        winner: Fleet | null;

        // Retrievable loot
        loot: Equipment[];

        constructor(winner: Fleet | null) {
            this.winner = winner;
            this.draw = winner ? false : true;
            this.loot = [];
        }

        /**
         * Fill loot from defeated fleet
         */
        createLoot(battle: Battle, random = RandomGenerator.global): void {
            this.loot = [];

            battle.fleets.forEach(fleet => {
                if (this.winner && !this.winner.player.is(fleet.player)) {
                    fleet.ships.forEach(ship => {
                        var luck = random.random();
                        if (luck > 0.9) {
                            // Salvage a supposedly transported item
                            var transported = this.generateLootItem(random, ship.level.get());
                            if (transported) {
                                this.loot.push(transported);
                            }
                        } else if (luck > 0.5) {
                            // Salvage one equipped item
                            var token = ship.getRandomEquipment(random);
                            if (token) {
                                token.detach();
                                this.loot.push(token);
                            }
                        }
                    });
                }
            });
        }

        /**
         * Grant experience to participating fleets
         */
        grantExperience(fleets: Fleet[]) {
            fleets.forEach(fleet => {
                let winfactor = (fleet == this.winner) ? 0.03 : (this.draw ? 0.01 : 0.005);
                let enemies = flatten(fleets.filter(f => f !== fleet).map(f => f.ships));
                let difficulty = sum(enemies.map(enemy => 100 + enemy.level.getExperience()));
                fleet.ships.forEach(ship => {
                    ship.level.addExperience(Math.floor(difficulty * winfactor));
                    ship.level.checkLevelUp();
                });
            });
        }

        /**
         * Create a loot generator for lucky finds
         */
        getLootGenerator(random: RandomGenerator): LootGenerator {
            return new LootGenerator(random);
        }

        /**
         * Generate a loot item for the winner fleet
         * 
         * The equipment will be in the dead ship range
         */
        generateLootItem(random: RandomGenerator, base_level: number): Equipment | null {
            let generator = this.getLootGenerator(random);
            let level = random.randInt(Math.max(base_level - 1, 1), base_level + 1);
            let quality = random.random();
            return generator.generate(level, this.getQuality(quality));
        }

        /**
         * Get the quality enum matching a 0-1 value
         */
        getQuality(quality: number): EquipmentQuality {
            if (quality < 0.1) {
                return EquipmentQuality.WEAK;
            } else if (quality > 0.99) {
                return EquipmentQuality.LEGENDARY;
            } else if (quality > 0.95) {
                return EquipmentQuality.PREMIUM;
            } else if (quality > 0.8) {
                return EquipmentQuality.FINE;
            } else {
                return EquipmentQuality.COMMON;
            }
        }
    }
}
