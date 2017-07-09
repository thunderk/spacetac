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
        level: number
        around: StarLocation
        random: RandomGenerator

        constructor(universe: Universe, level: number, around: StarLocation, random = RandomGenerator.global) {
            this.universe = universe;
            this.level = level;
            this.around = around;
            this.random = random;
        }

        /**
         * Generate a single mission
         */
        generate(): Mission {
            let generators = [
                bound(this, "generateEscort")
            ];

            let generator = this.random.choice(generators);
            let result = generator();
            // TODO Add reward
            return result;
        }

        /**
         * Generate a new ship
         */
        private generateShip() {
            let generator = new ShipGenerator(this.random);
            let result = generator.generate(this.level, null, true);
            result.name = `${this.random.choice(POOL_SHIP_NAMES)}-${this.random.randInt(10, 999)}`;
            return result;
        }

        /**
         * Generate an escort mission
         */
        generateEscort(): Mission {
            let mission = new Mission(this.universe);
            let ship = this.generateShip();
            let dest_star = minBy(this.around.star.getNeighbors(), star => Math.abs(star.level - this.level));
            let destination = this.random.choice(dest_star.locations);
            mission.addPart(new MissionPartEscort(mission, destination, ship));
            mission.title = `Escort a ship to a level ${dest_star.level} system`;
            return mission;
        }
    }
}
