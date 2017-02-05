/// <reference path="Serializable.ts"/>

module TS.SpaceTac.Game {
    // A game session, binding a universe and a player
    export class GameSession extends Serializable {
        // Game universe
        universe: Universe;

        // Current connected player
        player: Player;

        constructor() {
            super();

            this.universe = new Universe();
            this.player = new Player(this.universe);
        }

        // Load a game state from a string
        static loadFromString(serialized: string): GameSession {
            var serializer = new Serializer();
            return <GameSession>serializer.unserialize(serialized);
        }

        // Serializes the game state to a string
        saveToString(): string {
            var serializer = new Serializer();
            return serializer.serialize(this);
        }

        // Generate a real single player game
        startNewGame(): void {
            var fleet_generator = new FleetGenerator();

            this.universe = new Universe();
            this.universe.generate();

            var start_location = this.universe.stars[0].locations[0];
            start_location.encounter_gen = true;
            start_location.encounter = null;

            this.player = new Game.Player(this.universe);
            this.player.fleet = fleet_generator.generate(1, this.player);
            this.player.fleet.setLocation(start_location);
        }

        // Start a new "quick battle" game
        startQuickBattle(with_ai: boolean = false): void {
            var battle = Game.Battle.newQuickRandom(with_ai);
            this.player = battle.fleets[0].player;
            this.player.setBattle(battle);
        }

        // Get currently played battle, null when none is in progress
        getBattle(): Battle {
            return this.player.getBattle();
        }

        /**
         * Return true if the session has a universe to explore
         */
        hasUniverse(): boolean {
            return this.universe.stars.length > 0;
        }
    }
}
