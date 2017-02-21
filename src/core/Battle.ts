module TS.SpaceTac {
    // A turn-based battle between fleets
    export class Battle {
        // Flag indicating if the battle is ended
        ended: boolean;

        // Battle outcome, if *ended* is true
        outcome: BattleOutcome;

        // Log of all battle events
        log: BattleLog;

        // List of fleets engaged in battle
        fleets: Fleet[];

        // List of ships, sorted by their initiative throw
        play_order: Ship[];

        // Current turn
        turn: number;

        // Current ship whose turn it is to play
        playing_ship_index: number;
        playing_ship: Ship;

        // List of deployed drones
        drones: Drone[] = [];

        // Size of the battle area
        width: number
        height: number

        // Timer to use for scheduled things
        timer = Timer.global;

        // Create a battle between two fleets
        constructor(fleet1: Fleet = null, fleet2: Fleet = null, width = 1780, height = 948) {
            this.log = new BattleLog();
            this.fleets = [fleet1 || new Fleet(), fleet2 || new Fleet()];
            this.play_order = [];
            this.playing_ship_index = null;
            this.playing_ship = null;
            this.ended = false;
            this.width = width;
            this.height = height;

            this.fleets.forEach((fleet: Fleet) => {
                fleet.setBattle(this);
            });
        }

        // Create a quick random battle, for testing purposes
        static newQuickRandom(start = true): Battle {
            var player1 = Player.newQuickRandom("John");
            var player2 = Player.newQuickRandom("Carl");

            var result = new Battle(player1.fleet, player2.fleet);
            if (start) {
                result.start();
            }
            return result;
        }

        // Check if a player is able to play
        //  This can be used by the UI to determine if player interaction is allowed
        canPlay(player: Player): boolean {
            if (this.ended) {
                return false;
            } else if (this.playing_ship && this.playing_ship.getPlayer() == player) {
                return this.playing_ship.isAbleToPlay(false);
            } else {
                return false;
            }
        }

        // Create play order, performing an initiative throw
        throwInitiative(gen: RandomGenerator = new RandomGenerator()): void {
            var play_order: Ship[] = [];

            // Throw each ship's initiative
            this.fleets.forEach(function (fleet: Fleet) {
                fleet.ships.forEach(function (ship: Ship) {
                    ship.throwInitiative(gen);
                    play_order.push(ship);
                });
            });

            // Sort by throw result
            play_order.sort(function (ship1: Ship, ship2: Ship) {
                return (ship2.play_priority - ship1.play_priority);
            });
            this.play_order = play_order;
        }

        // Defines the initial ship positions of all engaged fleets
        placeShips(): void {
            this.placeFleetShips(this.fleets[0], this.width * 0.05, this.height * 0.5, 0);
            this.placeFleetShips(this.fleets[1], this.width * 0.95, this.height * 0.5, Math.PI);
        }

        // Count the number of fleets still alive
        countAliveFleets(): number {
            var result = 0;
            this.fleets.forEach((fleet: Fleet) => {
                if (fleet.isAlive()) {
                    result += 1;
                }
            });
            return result;
        }

        // Collect all ships within a given radius of a target
        collectShipsInCircle(center: Target, radius: number, alive_only = false): Ship[] {
            var result: Ship[] = [];
            this.play_order.forEach(ship => {
                if ((ship.alive || !alive_only) && Target.newFromShip(ship).getDistanceTo(center) <= radius) {
                    result.push(ship);
                }
            });
            return result;
        }

        // Ends a battle and sets the outcome
        endBattle(winner: Fleet, log: boolean = true) {
            this.ended = true;
            this.outcome = new BattleOutcome(winner);
            if (winner) {
                this.outcome.createLoot(this);
            }
            if (log && this.log) {
                this.log.add(new EndBattleEvent(this.outcome));
            }
        }

        // Checks end battle conditions, returns true if the battle ended
        checkEndBattle(log: boolean = true) {
            if (this.ended) {
                return true;
            }

            var alive_fleets = this.countAliveFleets();

            if (alive_fleets === 0) {
                // It's a draw
                this.endBattle(null, log);
            } else if (alive_fleets === 1) {
                // We have a winner
                var winner: Fleet = null;
                this.fleets.forEach((fleet: Fleet) => {
                    if (fleet.isAlive()) {
                        winner = fleet;
                    }
                });
                this.endBattle(winner, log);
            }

            return this.ended;
        }

        // End the current ship turn, passing control to the next one in play order
        //  If at the end of the play order, next turn will start automatically
        //  Member 'play_order' must be defined before calling this function
        advanceToNextShip(log: boolean = true): void {
            var previous_ship = this.playing_ship;

            if (this.checkEndBattle(log)) {
                return;
            }

            if (this.playing_ship && this.playing_ship.playing) {
                this.playing_ship.endTurn();
            }

            if (this.play_order.length === 0) {
                this.playing_ship_index = null;
                this.playing_ship = null;
            } else {
                if (this.playing_ship_index == null) {
                    this.playing_ship_index = 0;
                } else {
                    this.playing_ship_index = (this.playing_ship_index + 1) % this.play_order.length;
                }
                this.playing_ship = this.play_order[this.playing_ship_index];
            }

            if (this.playing_ship) {
                if (this.playing_ship_index == 0) {
                    this.turn += 1;
                }
                this.playing_ship.startTurn();
            }

            if (log) {
                this.log.add(new ShipChangeEvent(previous_ship, this.playing_ship));
            }
        }

        /**
         * Make an AI play the current ship
         */
        playAI(ai: AbstractAI | null = null) {
            if (!ai) {
                // TODO Use an AI adapted to the fleet
                ai = new BullyAI(this.playing_ship, this.timer);
            }
            ai.play();
        }

        // Start the battle
        //  This will call all necessary initialization steps (initiative, placement...)
        //  This will not add any event to the battle log
        start(): void {
            this.ended = false;
            this.turn = 0;
            this.placeShips();
            this.throwInitiative();
            this.play_order.forEach((ship: Ship) => {
                ship.startBattle();
            });
            this.advanceToNextShip();
        }

        // Force an injection of events in the battle log to simulate the initial state
        //  For instance, this may be called after 'start', to use the log subscription system
        //  to initialize a battle UI
        //  Attributes 'play_order' and 'playing_ship' should be defined before calling this
        injectInitialEvents(): void {
            var log = this.log;

            // Simulate initial ship placement
            this.play_order.forEach(ship => {
                let event = new MoveEvent(ship, ship.arena_x, ship.arena_y);
                event.initial = true;
                log.add(event);
            });

            // Indicate emergency stasis
            this.play_order.forEach(ship => {
                if (!ship.alive) {
                    let event = new DeathEvent(ship);
                    event.initial = true;
                    log.add(event);
                }
            });

            // Simulate drones deployment
            this.drones.forEach(drone => {
                let event = new DroneDeployedEvent(drone);
                event.initial = true;
                log.add(event);
            });

            // Simulate game turn
            if (this.playing_ship) {
                let event = new ShipChangeEvent(this.playing_ship, this.playing_ship);
                event.initial = true;
                log.add(event);
            }
        }

        // Defines the initial ship positions for one fleet
        //  x and y are the center of the fleet placement
        //  facing_angle is the forward angle in radians
        private placeFleetShips(fleet: Fleet, x: number, y: number, facing_angle: number): void {
            var side_angle = facing_angle + Math.PI * 0.5;
            var spacing = this.height * 0.2;
            var total_length = spacing * (fleet.ships.length - 1);
            var dx = Math.cos(side_angle);
            var dy = Math.sin(side_angle);
            x -= dx * total_length * 0.5;
            y -= dy * total_length * 0.5;
            for (var i = 0; i < fleet.ships.length; i++) {
                fleet.ships[i].setArenaPosition(x + i * dx * spacing, y + i * dy * spacing);
                fleet.ships[i].setArenaFacingAngle(facing_angle);
            }
        }

        /**
         * Add a drone to the battle
         */
        addDrone(drone: Drone, log = true) {
            if (add(this.drones, drone)) {
                if (log) {
                    this.log.add(new DroneDeployedEvent(drone));
                }
                drone.onDeploy(this.play_order);
            }
        }

        /**
         * Remove a drone from the battle
         */
        removeDrone(drone: Drone, log = true) {
            if (remove(this.drones, drone)) {
                if (log) {
                    this.log.add(new DroneDestroyedEvent(drone));
                }
            }
        }
    }
}
