module TS.SpaceTac {
    // A game session, binding a universe and a player
    export class GameSession {
        // Game universe
        universe: Universe;

        // Current connected player
        player: Player;

        constructor() {
            this.universe = new Universe();
            this.player = new Player(this.universe);
        }

        // Load a game state from a string
        static loadFromString(serialized: string): GameSession {
            var serializer = new Serializer(TS.SpaceTac);
            return <GameSession>serializer.unserialize(serialized);
        }

        // Serializes the game state to a string
        saveToString(): string {
            var serializer = new Serializer(TS.SpaceTac);
            return serializer.serialize(this);
        }

        // Generate a real single player game (campaign)
        startNewGame(): void {
            var fleet_generator = new FleetGenerator();

            this.universe = new Universe();
            this.universe.generate();

            var start_location = this.universe.stars[0].locations[0];
            start_location.clearEncounter();
            start_location.addShop(50);

            this.player = new Player(this.universe);
            this.player.fleet = fleet_generator.generate(1, this.player);
            this.player.fleet.setLocation(start_location);
            this.player.fleet.credits = 500;
        }

        // Start a new "quick battle" game
        startQuickBattle(with_ai: boolean = false): void {
            var battle = Battle.newQuickRandom();
            this.player = battle.fleets[0].player;
            this.player.setBattle(battle);
        }

        // Get currently played battle, null when none is in progress
        getBattle(): Battle | null {
            return this.player.getBattle();
        }

        /**
         * Set the end of current battle
         */
        setBattleEnded() {
            let battle = this.getBattle();

            if (battle && battle.ended) {
                if (battle.outcome.winner == this.player.fleet) {
                    // In case of victory, generate loot
                    battle.outcome.createLoot(battle);

                    // In case of victorious encounter, clear the encouter
                    let location = this.player.fleet.location;
                    if (location) {
                        location.clearEncounter();
                    }
                }
            }
        }

        /**
         * Return true if the session has a universe to explore
         */
        hasUniverse(): boolean {
            return this.universe.stars.length > 0;
        }
    }
}
