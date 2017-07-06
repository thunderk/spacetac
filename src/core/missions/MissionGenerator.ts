module TS.SpaceTac {
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
         * Generate an escort mission
         */
        generateEscort(): Mission {
            let mission = new Mission(this.universe);
            let ship = new Ship();
            let dest_star = minBy(this.around.star.getNeighbors(), star => Math.abs(star.level - this.level));
            let destination = this.random.choice(dest_star.locations);
            mission.addPart(new MissionPartEscort(mission, destination, ship));
            mission.title = `Escort a ship to a level ${dest_star.level} system`;
            return mission;
        }
    }
}
