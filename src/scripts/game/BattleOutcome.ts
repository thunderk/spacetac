module SpaceTac.Game {
    "use strict";

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
                                // TODO Salvage a supposedly transported item
                            } else if (luck > 0.5) {
                                // TODO Salvage an equipped item
                            }
                        }
                    }
                });
            });
        }
    }
}
