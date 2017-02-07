module TS.SpaceTac.Game {
    // Result of an ended battle
    export class BattleOutcome {
        // Indicates if the battle is a draw (no winner)
        draw: boolean;

        // Victorious fleet
        winner: Fleet;

        // Retrievable loot
        loot: Equipment[];

        constructor(winner: Fleet) {
            this.winner = winner;
            this.draw = winner ? false : true;
            this.loot = [];
        }

        // Create loot from dead ships
        createLoot(battle: Battle, random: RandomGenerator = new RandomGenerator()): void {
            this.loot = [];
            battle.fleets.forEach((fleet: Fleet) => {
                fleet.ships.forEach((ship: Ship) => {
                    if (!ship.alive) {
                        if (ship.fleet === this.winner) {
                            // Member of the winner fleet, salvage a number of equipments
                            var count = random.throwInt(0, ship.getEquipmentCount());
                            while (count > 0) {
                                var salvaged = ship.getRandomEquipment(random);
                                salvaged.detach();
                                this.loot.push(salvaged);
                                count--;
                            }

                        } else {
                            var luck = random.throw();
                            if (luck > 0.9) {
                                // Salvage a supposedly transported item
                                var transported = this.generateLootItem(random, ship.level);
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
                        }
                    }
                });
            });
        }

        // Create a loot generator for lucky loots
        getLootGenerator(random: RandomGenerator): LootGenerator {
            return new LootGenerator(random);
        }

        // Generate a special loot item for the winner fleet
        //  The equipment will be in the dead ship range
        generateLootItem(random: RandomGenerator, base_level: number): Equipment {
            var generator = this.getLootGenerator(random);
            var level = new IntegerRange(base_level - 1, base_level + 1);
            return generator.generate(level);
        }
    }
}
