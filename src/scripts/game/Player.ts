module SpaceTac.Game {
    "use strict";

    // One player (human or IA)
    export class Player {
        // Current fleet
        fleet: Fleet;

        // AI playing (null for human player)
        ai: AI.AbstractAI;

        // Create a player, with an empty fleet
        constructor() {
            this.fleet = new Fleet(this);
            this.ai = null;
        }

        // Create a quick random player, with a fleet, for testing purposes
        static newQuickRandom(name: String): Player {
            var player = new Player();
            var ship: Ship;
            var ship_generator = new ShipGenerator();

            ship = ship_generator.generate(1);
            ship.name = name + "'s First";
            player.fleet.addShip(ship);

            ship = ship_generator.generate(1);
            ship.name = name + "'s Second";
            player.fleet.addShip(ship);

            ship = ship_generator.generate(1);
            ship.name = name + "'s Third";
            player.fleet.addShip(ship);

            ship = ship_generator.generate(1);
            ship.name = name + "'s Fourth";
            player.fleet.addShip(ship);

            return player;
        }
    }
}
