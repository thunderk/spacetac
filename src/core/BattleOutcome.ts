module TS.SpaceTac {
    // Result of an ended battle
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
                if (this.winner && this.winner.player != fleet.player) {
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

        // Create a loot generator for lucky loots
        getLootGenerator(random: RandomGenerator): LootGenerator {
            return new LootGenerator(random);
        }

        // Generate a special loot item for the winner fleet
        //  The equipment will be in the dead ship range
        generateLootItem(random: RandomGenerator, base_level: number): Equipment | null {
            var generator = this.getLootGenerator(random);
            var level = new IntegerRange(base_level - 1, base_level + 1);
            return generator.generate(level);
        }
    }
}
