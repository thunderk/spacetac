module TK.SpaceTac {
    /**
     * A turn-based battle between fleets
     */
    export class Battle {
        // Battle outcome, if the battle has ended
        outcome: BattleOutcome | null = null

        // Battle cheats
        cheats: BattleCheats

        // Statistics
        stats: BattleStats

        // Log of all battle events
        log: BattleLog

        // List of fleets engaged in battle
        fleets: Fleet[]

        // Container of all engaged ships
        ships: RObjectContainer<Ship>

        // List of playing ships, sorted by their initiative throw
        play_order: Ship[]
        play_index = -1

        // Current battle "cycle" (one cycle is one turn done for all ships in the play order)
        cycle = 0

        // List of deployed drones
        drones = new RObjectContainer<Drone>()

        // Size of the battle area
        width: number
        height: number
        border = 50
        ship_separation = 100

        // Timer to use for scheduled things
        timer = Timer.global

        // Indicator that an AI is playing
        ai_playing = false

        constructor(fleet1 = new Fleet(new Player(undefined, "Attacker")), fleet2 = new Fleet(new Player(undefined, "Defender")), width = 1808, height = 948) {
            this.fleets = [fleet1, fleet2];
            this.ships = new RObjectContainer(fleet1.ships.concat(fleet2.ships));
            this.play_order = [];
            this.width = width;
            this.height = height;

            this.log = new BattleLog();
            this.stats = new BattleStats();
            this.cheats = new BattleCheats(this, fleet1.player);

            this.fleets.forEach((fleet: Fleet) => {
                fleet.setBattle(this);
            });
        }

        postUnserialize() {
            this.ai_playing = false;
        }

        /**
         * Property is true if the battle has ended
         */
        get ended(): boolean {
            return bool(this.outcome);
        }

        /**
         * Apply a list of diffs to the game state, and add them to the log.
         * 
         * This should be the main way to modify the game state.
         */
        applyDiffs(diffs: BaseBattleDiff[]): void {
            let client = new BattleLogClient(this, this.log);
            diffs.forEach(diff => client.add(diff));
        }

        /**
         * Create a quick random battle, for testing purposes, or quick skirmish
         */
        static newQuickRandom(start = true, level = 1, shipcount = 5): Battle {
            let player1 = Player.newQuickRandom("Player", level, shipcount, true);
            let player2 = Player.newQuickRandom("Enemy", level, shipcount, true);

            let result = new Battle(player1.fleet, player2.fleet);
            if (start) {
                result.start();
            }
            return result;
        }

        /**
         * Get the currently playing ship
         */
        get playing_ship(): Ship | null {
            return this.play_order[this.play_index] || null;
        }

        /**
         * Get a ship by its ID.
         */
        getShip(id: RObjectId | null): Ship | null {
            if (id === null) {
                return null;
            } else {
                return this.ships.get(id);
            }
        }

        /**
         * Return an iterator over all ships engaged in the battle
         */
        iships(alive_only = false): Iterator<Ship> {
            let result = ichainit(imap(iarray(this.fleets), fleet => iarray(fleet.ships)));
            return alive_only ? ifilter(result, ship => ship.alive) : result;
        }

        /**
         * Return an iterator over ships allies of (or owned by) a player
         */
        iallies(player: Player, alive_only = false): Iterator<Ship> {
            return ifilter(this.iships(alive_only), ship => ship.getPlayer() === player);
        }

        /**
         * Return an iterator over ships enemy of a player
         */
        ienemies(player: Player, alive_only = false): Iterator<Ship> {
            return ifilter(this.iships(alive_only), ship => ship.getPlayer() !== player);
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
            this.play_index = -1;
        }

        /**
         * Get the number of turns before a specific ship plays (currently playing ship will return 0).
         * 
         * Returns -1 if the ship is not in the play list.
         */
        getPlayOrder(ship: Ship): number {
            let index = this.play_order.indexOf(ship);
            if (index < 0) {
                return -1;
            } else {
                let result = index - this.play_index;
                return (result < 0) ? (result + this.play_order.length) : result;
            }
        }

        /**
         * Add a ship in the play order list
         */
        removeFromPlayOrder(idx: number): void {
            this.play_order.splice(idx, 1);
            if (idx <= this.play_index) {
                this.play_index -= 1;
            }
        }

        /**
         * Remove a ship from the play order list
         */
        insertInPlayOrder(idx: number, ship: Ship): void {
            this.play_order.splice(idx, 0, ship);
            if (idx <= this.play_index) {
                this.play_index += 1;
            }
        }

        /**
         * Set the currently playing ship
         */
        setPlayingShip(ship: Ship): void {
            let current = this.playing_ship;
            if (current) {
                current.playing = false;
            }

            this.play_index = this.play_order.indexOf(ship);
            this.ai_playing = false;

            current = this.playing_ship;
            if (current) {
                current.playing = true;
            }
        }

        // Defines the initial ship positions of all engaged fleets
        placeShips(vertical = true): void {
            if (vertical) {
                this.placeFleetShips(this.fleets[0], this.width * 0.25, this.height * 0.5, 0, this.height);
                this.placeFleetShips(this.fleets[1], this.width * 0.75, this.height * 0.5, Math.PI, this.height);
            } else {
                this.placeFleetShips(this.fleets[0], this.width * 0.5, this.height * 0.90, -Math.PI / 2, this.width);
                this.placeFleetShips(this.fleets[1], this.width * 0.5, this.height * 0.10, Math.PI / 2, this.width);
            }
        }

        // Collect all ships within a given radius of a target
        collectShipsInCircle(center: Target, radius: number, alive_only = false): Ship[] {
            return imaterialize(ifilter(this.iships(), ship => (ship.alive || !alive_only) && Target.newFromShip(ship).getDistanceTo(center) <= radius));
        }

        /**
         * Ends the battle and sets the outcome
         */
        endBattle(winner: Fleet | null) {
            this.applyDiffs([new EndBattleDiff(winner, this.cycle)]);
        }

        /**
         * Get the next playing ship
         */
        getNextShip(): Ship {
            return this.play_order[(this.play_index + 1) % this.play_order.length];
        }

        /**
         * Make an AI play the current ship
         */
        playAI(ai: AbstractAI | null = null, debug = false): boolean {
            if (this.playing_ship && !this.ai_playing) {
                this.ai_playing = true;
                if (!ai) {
                    // TODO Use an AI adapted to the fleet
                    ai = new TacticalAI(this.playing_ship, this.timer);
                }
                ai.play(debug);
                return true;
            } else {
                return false;
            }
        }

        /**
         * Start the battle
         * 
         * This will call all necessary initialization steps (initiative, placement...)
         * 
         * This should not put any diff in the log
         */
        start(): void {
            this.outcome = null;
            this.cycle = 1;
            this.placeShips();
            this.stats.onBattleStart(this.fleets[0], this.fleets[1]);
            this.throwInitiative();
            iforeach(this.iships(), ship => ship.restoreInitialState());
            this.setPlayingShip(this.play_order[0]);
        }

        /**
         * Force current ship's turn to end, then advance to the next one
         */
        advanceToNextShip(): void {
            if (this.playing_ship) {
                this.applyOneAction(EndTurnAction.SINGLETON);
            } else if (this.play_order.length) {
                this.setPlayingShip(this.play_order[0]);
            }
        }

        /**
         * Defines the initial ship positions for one fleet
         * 
         * *x* and *y* are the center of the fleet formation
         * *facing_angle* is the forward angle in radians
         * *width* is the formation width
         */
        private placeFleetShips(fleet: Fleet, x: number, y: number, facing_angle: number, width: number): void {
            var side_angle = facing_angle + Math.PI * 0.5;
            var spacing = width * 0.2;
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
        addDrone(drone: Drone) {
            this.drones.add(drone);
        }

        /**
         * Remove a drone from the battle
         */
        removeDrone(drone: Drone) {
            this.drones.remove(drone);
        }

        /**
         * Get the list of area effects at a given location
         */
        iAreaEffects(x: number, y: number): Iterator<BaseEffect> {
            let drones_in_range = ifilter(this.drones.iterator(), drone => drone.isInRange(x, y));

            return ichain(
                ichainit(imap(drones_in_range, drone => iarray(drone.effects))),
                ichainit(imap(this.iships(), ship => ship.iAreaEffects(x, y)))
            );
        }

        /**
         * Perform all battle checks to ensure the state is consistent
         */
        performChecks(): void {
            let checks = new BattleChecks(this);
            checks.apply();
        }

        /**
         * Apply one action to the battle state
         * 
         * At the end of the action, some checks will be applied to ensure the battle state is consistent
         */
        applyOneAction(action: BaseAction, target?: Target): boolean {
            let ship = this.playing_ship;
            if (ship) {
                if (!target) {
                    target = action.getDefaultTarget(ship);
                }
                if (action.apply(this, ship, target)) {
                    this.performChecks();

                    if (!this.ended) {
                        this.applyDiffs([new ShipActionEndedDiff(ship, action, target)]);

                        if (ship.playing && ship.getValue("hull") <= 0) {
                            // Playing ship died during its action, force a turn end
                            this.applyOneAction(EndTurnAction.SINGLETON);
                        }
                    }

                    return true;
                } else {
                    return false;
                }
            } else {
                console.error("Cannot apply action - ship not playing", action, this);
                return false;
            }
        }

        /**
         * Revert the last applied action
         * 
         * This will remove diffs from the log, so pay attention to other log clients!
         */
        revertOneAction(): void {
            let client = new BattleLogClient(this, this.log);
            while (!client.atStart() && !(client.getCurrent() instanceof ShipActionUsedDiff)) {
                client.backward();
            }
            if (!client.atStart()) {
                client.backward();
            }
            client.truncate();
        }
    }
}
