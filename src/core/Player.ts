module TS.SpaceTac {
    // One player (human or IA)
    export class Player {
        // Player's name
        name: string;

        // Universe in which we are playing
        universe: Universe;

        // Current fleet
        fleet: Fleet;

        // List of visited star systems
        visited: StarLocation[] = [];

        // Create a player, with an empty fleet
        constructor(universe: Universe = new Universe(), name = "Player") {
            this.universe = universe;
            this.name = name;
            this.fleet = new Fleet(this);
        }

        // Create a quick random player, with a fleet, for testing purposes
        static newQuickRandom(name: string, level = 1, shipcount = 4, upgrade = false): Player {
            let player = new Player(new Universe(), name);
            let generator = new FleetGenerator();
            player.fleet = generator.generate(level, player, shipcount, upgrade);
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
        getBattle(): Battle | null {
            return this.fleet.battle;
        }
        setBattle(battle: Battle | null): void {
            this.fleet.setBattle(battle);
        }

        /**
         * Exit the current battle unconditionally, if any
         * 
         * This does not apply retreat penalties, or battle outcome, only unbind the battle from current session
         */
        exitBattle(): void {
            this.setBattle(null);
        }

        /**
         * Revert current battle, and put the player's fleet to its previous location, as if the battle never happened
         */
        revertBattle(): void {
            this.exitBattle();

            if (this.fleet.previous_location) {
                this.fleet.setLocation(this.fleet.previous_location);
            }
        }
    }
}
