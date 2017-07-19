module TS.SpaceTac.UI {
    /**
     * Processor of events coming from the battle log
     * 
     * This will bind to the battle log to receive new events, and update 
     * the battle view accordingly.
     * 
     * It is also possible to go back/forward in time.
     */
    export class LogProcessor {
        // Link to the battle view
        private view: BattleView

        // Link to the battle
        private battle: Battle

        // Link to the battle log
        private log: BattleLog

        // Forward events to other subscribers
        private forwarding: ((event: BaseBattleEvent) => number)[] = []

        // Current position in the battle log
        private cursor = -1

        // Indicator that the log is being played continuously
        private playing = false

        constructor(view: BattleView) {
            this.view = view;
            this.battle = view.battle;
            this.log = view.battle.log;

            view.inputs.bindCheat("PageUp", "Step backward", () => {
                this.stepBackward();
            });
            view.inputs.bindCheat("PageDown", "Step forward", () => {
                this.stepForward();
            });
            view.inputs.bindCheat("Home", "Jump to beginning", () => {
                this.jumpToStart();
            });
            view.inputs.bindCheat("End", "Jump to end", () => {
                this.jumpToEnd();
            });
        }

        /**
         * Start log processing
         */
        start() {
            this.cursor = this.log.events.length - 1;
            this.battle.getBootstrapEvents().forEach(event => this.processBattleEvent(event));

            this.playing = true;
            if (!this.view.gameui.headless) {
                this.playContinuous();
            }
        }

        /**
         * Play the log continuously
         */
        playContinuous() {
            let delay = 0;

            if (this.playing && !this.view.game.paused) {
                delay = this.stepForward();
                if (delay == 0) {
                    delay = this.transferControl();
                }
            }

            this.view.timer.schedule(Math.max(delay, 50), () => this.playContinuous());
        }

        /**
         * Make a step backward in time
         */
        stepBackward() {
            if (!this.atStart()) {
                this.cursor -= 1;
                this.playing = false;
                this.processBattleEvent(this.log.events[this.cursor + 1].getReverse());
            }
        }

        /**
         * Make a step forward in time
         * 
         * Returns the duration of the step processing
         */
        stepForward(): number {
            if (!this.atEnd()) {
                this.cursor += 1;
                let result = this.processBattleEvent(this.log.events[this.cursor]);

                if (this.atEnd()) {
                    this.playing = true;
                }

                return result;
            } else {
                return 0;
            }
        }

        /**
         * Jump to the start of the log
         * 
         * This will rewind all applied event
         */
        jumpToStart() {
            while (!this.atStart()) {
                this.stepBackward();
            }
        }

        /**
         * Jump to the end of the log
         * 
         * This will apply all remaining event
         */
        jumpToEnd() {
            while (!this.atEnd()) {
                this.stepForward();
            }
        }

        /**
         * Check if we are currently at the start of the log
         */
        atStart(): boolean {
            return this.cursor < 0;
        }

        /**
         * Check if we are currently at the end of the log
         */
        atEnd(): boolean {
            return this.cursor >= this.log.events.length - 1;
        }

        /**
         * Check if we need a player or AI to interact at this point
         */
        getPlayerNeeded(): Player | null {
            if (this.atEnd()) {
                return this.battle.playing_ship ? this.battle.playing_ship.getPlayer() : null;
            } else {
                return null;
            }
        }

        /**
         * Register a sub-subscriber.
         * 
         * The difference with registering directly to the BattleLog is that events may be delayed
         * for animations.
         * 
         * The callback may return the duration it needs to display the change.
         */
        register(callback: (event: BaseBattleEvent) => number) {
            this.forwarding.push(callback);
        }

        /**
         * Register a sub-subscriber, to receive events for a specific ship
         */
        registerForShip(ship: Ship, callback: (event: BaseLogShipEvent) => number) {
            this.register(event => {
                if (event instanceof BaseLogShipEvent && event.ship === ship) {
                    return callback(event);
                } else {
                    return 0;
                }
            });
        }

        /**
         * Process a single event
         */
        processBattleEvent(event: BaseBattleEvent): number {
            console.log("Battle event", event);

            let durations = this.forwarding.map(subscriber => subscriber(event));

            if (event instanceof ShipChangeEvent) {
                durations.push(this.processShipChangeEvent(event));
            } else if (event instanceof DeathEvent) {
                durations.push(this.processDeathEvent(event));
            } else if (event instanceof FireEvent) {
                durations.push(this.processFireEvent(event));
            } else if (event instanceof DamageEvent) {
                durations.push(this.processDamageEvent(event));
            } else if (event instanceof EndBattleEvent) {
                durations.push(this.processEndBattleEvent(event));
            } else if (event instanceof DroneDeployedEvent) {
                durations.push(this.processDroneDeployedEvent(event));
            } else if (event instanceof DroneDestroyedEvent) {
                durations.push(this.processDroneDestroyedEvent(event));
            } else if (event instanceof DroneAppliedEvent) {
                durations.push(this.processDroneAppliedEvent(event));
            }

            return max([0].concat(durations));
        }

        /**
         * Transfer control to the needed player (or not)
         */
        private transferControl(): number {
            let player = this.getPlayerNeeded();
            if (player) {
                if (this.battle.playing_ship && !this.battle.playing_ship.alive) {
                    this.view.setInteractionEnabled(false);
                    this.battle.advanceToNextShip();
                    return 200;
                } else if (player === this.view.player) {
                    this.view.setInteractionEnabled(true);
                    return 0;
                } else {
                    this.view.playAI();
                    return 0;
                }
            } else {
                this.view.setInteractionEnabled(false);
                return 0;
            }
        }

        // Playing ship changed
        private processShipChangeEvent(event: ShipChangeEvent): number {
            this.view.arena.setShipPlaying(event.new_ship);
            this.view.ship_list.setPlaying(event.new_ship);
            if (event.ship !== event.new_ship) {
                this.view.audio.playOnce("battle-ship-change");
            }
            return 0;
        }

        // Damage to ship
        private processDamageEvent(event: DamageEvent): number {
            var item = this.view.ship_list.findItem(event.ship);
            if (item) {
                item.setDamageHit();
            }
            return 0;
        }

        // A ship died
        private processDeathEvent(event: DeathEvent): number {
            if (this.view.ship_hovered === event.ship) {
                this.view.setShipHovered(null);
            }
            this.view.arena.markAsDead(event.ship);
            this.view.ship_list.markAsDead(event.ship);

            return event.initial ? 0 : 1000;
        }

        // Weapon used
        private processFireEvent(event: FireEvent): number {
            var effect = new WeaponEffect(this.view.arena, event.ship, event.target, event.weapon);
            let duration = effect.start();

            return duration;
        }

        // Battle ended (victory or defeat)
        private processEndBattleEvent(event: EndBattleEvent): number {
            this.view.endBattle();
            return 0;
        }

        // New drone deployed
        private processDroneDeployedEvent(event: DroneDeployedEvent): number {
            let duration = this.view.arena.addDrone(event.drone, !event.initial);

            if (duration) {
                this.view.gameui.audio.playOnce("battle-drone-deploy");
            }

            return duration;
        }

        // Drone destroyed
        private processDroneDestroyedEvent(event: DroneDestroyedEvent): number {
            this.view.arena.removeDrone(event.drone);
            if (!event.initial) {
                this.view.gameui.audio.playOnce("battle-drone-destroy");
                return 1000;
            } else {
                return 0;
            }
        }

        // Drone applied
        private processDroneAppliedEvent(event: DroneAppliedEvent): number {
            let drone = this.view.arena.findDrone(event.drone);
            if (drone) {
                let duration = drone.setApplied();

                if (duration) {
                    this.view.gameui.audio.playOnce("battle-drone-activate");
                }

                return duration;
            } else {
                return 0;
            }
        }
    }
}
