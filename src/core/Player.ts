/// <reference path="../common/RObject.ts" />

module TK.SpaceTac {
    /**
     * One player (human or IA)
     */
    export class Player extends RObject {
        // Player's name
        name: string

        // Bound fleet
        fleet: Fleet

        // Active missions
        missions = new ActiveMissions()

        // Create a player, with an empty fleet
        constructor(name = "Player", fleet?: Fleet) {
            super();

            this.name = name;
            this.fleet = fleet || new Fleet(this);

            this.fleet.setPlayer(this);
        }

        // Create a quick random player, with a fleet, for testing purposes
        static newQuickRandom(name: string, level = 1, shipcount = 4, upgrade = false): Player {
            let player = new Player(name);
            let generator = new FleetGenerator();
            player.fleet = generator.generate(level, player, shipcount, upgrade);
            return player;
        }

        /**
         * Set the fleet for this player
         */
        setFleet(fleet: Fleet): void {
            this.fleet = fleet;
            fleet.setPlayer(this);
        }

        /**
         * Get a cheats object
         */
        getCheats(): BattleCheats | null {
            let battle = this.getBattle();
            if (battle) {
                return new BattleCheats(battle, this);
            } else {
                return null;
            }
        }

        /**
         * Return true if the player has visited at least one location in a given system.
         */
        hasVisitedSystem(system: Star): boolean {
            return intersection(this.fleet.visited, system.locations.map(loc => loc.id)).length > 0;
        }

        /**
         * Return true if the player has visited a given star location.
         */
        hasVisitedLocation(location: StarLocation): boolean {
            return contains(this.fleet.visited, location.id);
        }

        // Get currently played battle, null when none is in progress
        getBattle(): Battle | null {
            return this.fleet.battle;
        }
        setBattle(battle: Battle | null): void {
            this.fleet.setBattle(battle);
            this.missions.checkStatus();
        }
    }
}
