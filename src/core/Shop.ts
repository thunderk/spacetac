module TK.SpaceTac {
    /**
     * A shop is a place to buy/sell equipments
     */
    export class Shop {
        // Average level of equipment
        private level: number

        // Random generator
        private random: RandomGenerator

        // Available missions
        private missions: Mission[] = []

        constructor(level = 1) {
            this.level = level;
            this.random = new RandomGenerator();
        }

        /**
         * Get a list of available secondary missions
         */
        getMissions(around: StarLocation, max_count = 3): Mission[] {
            while (this.missions.length < max_count) {
                let generator = new MissionGenerator(around.star.universe, around, this.random);
                let mission = generator.generate();
                this.missions.push(mission);
            }

            return this.missions;
        }

        /**
         * Assign a mission to a fleet
         * 
         * Returns true on success
         */
        acceptMission(mission: Mission, player: Player): boolean {
            if (contains(this.missions, mission)) {
                if (player.missions.addSecondary(mission, player.fleet)) {
                    remove(this.missions, mission);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
}