module TK.SpaceTac {
    // Generator of balanced ships to form a fleet
    export class FleetGenerator {
        // Random generator to use
        random: RandomGenerator;

        constructor(random = RandomGenerator.global) {
            this.random = random;
        }

        /**
         * Generate a fleet of a given level
         */
        generate(level: number, player?: Player, ship_count = 3, upgrade = false): Fleet {
            var fleet = new Fleet(player);
            var ship_generator = new ShipGenerator(this.random);

            let models = this.random.sample(ShipModel.getDefaultCollection(), ship_count);

            range(ship_count).forEach(i => {
                var ship = ship_generator.generate(level, models[i] || null, upgrade, i < ship_count * 0.6);
                ship.name = ship.model.name;
                fleet.addShip(ship);
            });

            return fleet;
        }
    }
}
