module TS.SpaceTac {
    // Generator of balanced ships to form a fleet
    export class FleetGenerator {
        // Random generator to use
        random: RandomGenerator;

        constructor(random = RandomGenerator.global) {
            this.random = random;
        }

        // Generate a fleet of a given level
        generate(level: number, player?: Player, ship_count = 3): Fleet {
            var fleet = new Fleet(player);
            var ship_generator = new ShipGenerator(this.random);

            while (ship_count--) {
                var ship = ship_generator.generate(level);
                ship.name = "Ship " + ship_count.toString();
                fleet.addShip(ship);
            }

            return fleet;
        }
    }
}
