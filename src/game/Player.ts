/// <reference path="Serializable.ts"/>

module TS.SpaceTac.Game {
    // One player (human or IA)
    export class Player extends Serializable {
        // Universe in which we are playing
        universe: Universe;

        // Current fleet
        fleet: Fleet;

        // AI playing (null for human player)
        ai: AI.AbstractAI;

        // List of visited star systems
        visited: StarLocation[] = [];

        // Create a player, with an empty fleet
        constructor(universe: Universe = new Universe()) {
            super();

            this.universe = universe;
            this.fleet = new Fleet(this);
            this.ai = null;
        }

        // Create a quick random player, with a fleet, for testing purposes
        static newQuickRandom(name: String): Player {
            var player = new Player(new Universe());
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

        /**
         * Return true if the player has visited at least one location in a given system.
         */
        hasVisitedSystem(system: Star): boolean {
            return any(this.visited, location => location.star == system);
        }

        /**
         * Return true if the player has visited a given star location.
         */
        hasVisitedLocation(location: StarLocation): boolean {
            return contains(this.visited, location);
        }

        /**
         * Set a star location as visited.
         */
        setVisited(location: StarLocation): void {
            add(this.visited, location);
        }

        // Get currently played battle, null when none is in progress
        getBattle(): Battle {
            return this.fleet.battle;
        }
        setBattle(battle: Battle): void {
            this.fleet.setBattle(battle);
        }

        // Exit the current battle unconditionally, if any
        //  This does not apply retreat penalties, or battle outcome, only unbind the battle from current session
        exitBattle(): void {
            this.setBattle(null);
        }
    }
}
