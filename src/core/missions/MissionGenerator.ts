module TS.SpaceTac {
    const POOL_SHIP_NAMES = [
        "Zert",
        "Ob'tec",
        "Paayk",
        "Fen_amr",
        "TempZst",
        "croNt",
        "Appn",
        "Vertix",
        "Opan-vel",
        "Yz-aol",
        "Arkant",
        "PNX",
    ]

    /**
     * Random generator of secondary missions that can be taken from 
     */
    export class MissionGenerator {
        universe: Universe
        around: StarLocation
        random: RandomGenerator

        constructor(universe: Universe, around: StarLocation, random = RandomGenerator.global) {
            this.universe = universe;
            this.around = around;
            this.random = random;
        }

        /**
         * Generate a single mission
         */
        generate(): Mission {
            let generators = [
                bound(this, "generateEscort"),
                bound(this, "generateCleanLocation"),
            ];

            let generator = this.random.choice(generators);
            let result = generator();
            // TODO Add reward
            return result;
        }

        /**
         * Generate a new ship
         */
        private generateShip(level: number) {
            let generator = new ShipGenerator(this.random);
            let result = generator.generate(level, null, true);
            result.name = `${this.random.choice(POOL_SHIP_NAMES)}-${this.random.randInt(10, 999)}`;
            return result;
        }

        /**
         * Generate an escort mission
         */
        generateEscort(): Mission {
            let mission = new Mission(this.universe);
            let dest_star = this.random.choice(this.around.star.getNeighbors());
            let destination = this.random.choice(dest_star.locations);
            let ship = this.generateShip(dest_star.level);
            mission.addPart(new MissionPartEscort(mission, destination, ship));
            mission.title = `Escort a ship to a level ${dest_star.level} system`;
            return mission;
        }

        /**
         * Generate a clean location mission
         */
        generateCleanLocation(): Mission {
            let mission = new Mission(this.universe);
            let dest_star = this.random.choice(this.around.star.getNeighbors().concat([this.around.star]));
            let choices = dest_star.locations;
            if (dest_star == this.around.star) {
                choices = choices.filter(loc => loc != this.around);
            }
            let destination = this.random.choice(choices);
            mission.addPart(new MissionPartCleanLocation(mission, destination));
            mission.title = `Defeat a level ${destination.star.level} fleet in ${(dest_star == this.around.star) ? "this" : "a nearby"} system`;
            return mission;
        }
    }
}
