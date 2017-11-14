module TK.SpaceTac {
    /**
     * A game session, binding a universe and a player
     * 
     * This represents the current state of game
     */
    export class GameSession {
        // "Hopefully" unique session id
        id: string

        // Game universe
        universe: Universe

        // Current connected player
        player: Player

        // Personality reactions
        reactions: PersonalityReactions

        // Starting location
        start_location: StarLocation

        // Indicator that the session is the primary one
        primary = true

        // Indicator of spectator mode
        spectator = false

        // Indicator that introduction has been watched
        introduced = false

        constructor() {
            this.id = RandomGenerator.global.id(20);
            this.universe = new Universe();
            this.player = new Player(this.universe);
            this.reactions = new PersonalityReactions();
            this.start_location = new StarLocation();
        }

        /**
         * Get an indicative description of the session (to help identify game saves)
         */
        getDescription(): string {
            let level = this.player.fleet.getLevel();
            let ships = this.player.fleet.ships.length;
            return `Level ${level} - ${ships} ships`;
        }

        // Load a game state from a string
        static loadFromString(serialized: string): GameSession {
            var serializer = new Serializer(TK.SpaceTac);
            return <GameSession>serializer.unserialize(serialized);
        }

        // Serializes the game state to a string
        saveToString(): string {
            var serializer = new Serializer(TK.SpaceTac);
            return serializer.serialize(this);
        }

        /**
         * Generate a real single player game (campaign)
         * 
         * If *fleet* is false, the player fleet will be empty, and needs to be set with *setCampaignFleet*.
         */
        startNewGame(fleet = true, story = false): void {
            this.universe = new Universe();
            this.universe.generate();

            this.start_location = this.universe.getStartLocation();
            this.start_location.clearEncounter();
            this.start_location.removeShop();

            this.player = new Player(this.universe);

            this.reactions = new PersonalityReactions();

            if (fleet) {
                this.setCampaignFleet(null, story);
            }
        }

        /**
         * Set the initial campaign fleet, null for a default fleet
         * 
         * If *story* is true, the main story arc will be started.
         */
        setCampaignFleet(fleet: Fleet | null = null, story = true) {
            if (fleet) {
                this.player.fleet = fleet;
                fleet.player = this.player;
            } else {
                let fleet_generator = new FleetGenerator();
                this.player.fleet = fleet_generator.generate(1, this.player, 2);
            }

            this.player.fleet.setLocation(this.start_location, true);

            if (story) {
                this.player.missions.startMainStory(this.universe, this.player.fleet);
            }
        }

        // Start a new "quick battle" game
        startQuickBattle(with_ai: boolean = false): void {
            let battle = Battle.newQuickRandom(true, RandomGenerator.global.randInt(1, 10));
            this.player = battle.fleets[0].player;
            this.player.setBattle(battle);
            this.reactions = new PersonalityReactions();
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

            if (battle && battle.ended && battle.outcome) {
                // Generate experience
                battle.outcome.grantExperience(battle.fleets);

                // Reset ships status
                iforeach(battle.iships(), ship => ship.restoreInitialState());

                // In case of victory for current player, generate loot
                if (battle.outcome.winner == this.player.fleet) {
                    battle.outcome.createLoot(battle);
                }

                // If the battle happened in a star location, keep it informed
                let location = this.player.fleet.location;
                if (location) {
                    location.resolveEncounter(battle.outcome);
                }
            }
        }

        /**
         * Returns true if the session has an universe to explore (campaign mode)
         */
        hasUniverse(): boolean {
            return this.universe.stars.length > 0;
        }

        /**
         * Returns true if initial fleet creation has been done.
         */
        isFleetCreated(): boolean {
            return this.player.fleet.ships.length > 0;
        }

        /**
         * Returns true if campaign introduction has been watched
         */
        isIntroViewed(): boolean {
            return this.introduced;
        }
    }
}
