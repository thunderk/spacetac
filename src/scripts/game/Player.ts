/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    "use strict";

    // One player (human or IA)
    export class Player extends Serializable {
        // Current fleet
        fleet: Fleet;

        // AI playing (null for human player)
        ai: AI.AbstractAI;

        // List of visited star systems
        visited: Star[];

        // Create a player, with an empty fleet
        constructor() {
            super();

            this.fleet = new Fleet(this);
            this.ai = null;
            this.visited = [];
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

        // Check if the player has visited a given star system
        hasVisited(star: Star): boolean {
            return this.visited.indexOf(star) >= 0;
        }

        // Set a star system as visited
        setVisited(star: Star): void {
            if (!this.hasVisited(star)) {
                this.visited.push(star);
            }
        }
    }
}
