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

        // Subscription identifier
        private subscription: any = null

        // Delay before processing next events
        private delayed = false

        // Processing queue, when delay is active
        private queue: BaseBattleEvent[] = []

        // Forward events to other subscribers
        private forwarding: LogSubscriber[] = []

        // Current position in the battle log
        private cursor = -1;

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
            this.subscription = this.log.subscribe(event => this.processBattleEvent(event));
            this.cursor = this.log.events.length - 1;
            this.battle.getBootstrapEvents().forEach(event => this.processBattleEvent(event));
        }

        /**
         * Make a step backward in time
         */
        stepBackward() {
            if (!this.atStart()) {
                this.cursor -= 1;
                this.processBattleEvent(this.log.events[this.cursor + 1].getReverse());
            }
        }

        /**
         * Make a step forward in time
         */
        stepForward() {
            if (!this.atEnd()) {
                this.cursor += 1;
                this.processBattleEvent(this.log.events[this.cursor]);
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
            this.forwarding.push(event => {
                let duration = callback(event);
                if (duration) {
                    this.delayNextEvents(duration);
                }
            });
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
         * Introduce a delay in event processing
         */
        delayNextEvents(duration: number) {
            if (duration > 0 && !this.view.gameui.headless) {
                this.delayed = true;
                this.view.timer.schedule(duration, () => this.processQueued());
            }
        }

        /**
         * Process the events queued due to a delay
         */
        processQueued() {
            let events = acopy(this.queue);
            this.queue = [];
            this.delayed = false;

            events.forEach(event => this.processBattleEvent(event));
        }

        /**
         * Process a single event
         */
        processBattleEvent(event: BaseBattleEvent) {
            if (this.delayed) {
                this.queue.push(event);
                return;
            }

            console.log("Battle event", event);

            this.forwarding.forEach(subscriber => subscriber(event));

            if (event instanceof ShipChangeEvent) {
                this.processShipChangeEvent(event);
            } else if (event instanceof DeathEvent) {
                this.processDeathEvent(event);
            } else if (event instanceof FireEvent) {
                this.processFireEvent(event);
            } else if (event instanceof DamageEvent) {
                this.processDamageEvent(event);
            } else if (event instanceof EndBattleEvent) {
                this.processEndBattleEvent(event);
            } else if (event instanceof DroneDeployedEvent) {
                this.processDroneDeployedEvent(event);
            } else if (event instanceof DroneDestroyedEvent) {
                this.processDroneDestroyedEvent(event);
            } else if (event instanceof DroneAppliedEvent) {
                this.processDroneAppliedEvent(event);
            }

            // FIXME temporary fix for cursor not being forwarded
            let cursor = this.log.events.indexOf(event);
            if (cursor >= 0) {
                this.cursor = cursor;
            }

            // Transfer control to the needed player
            let player = this.getPlayerNeeded();
            if (player) {
                if (this.battle.playing_ship && !this.battle.playing_ship.alive) {
                    this.view.setInteractionEnabled(false);
                    this.battle.advanceToNextShip();
                    this.delayNextEvents(200);
                } else if (player === this.view.player) {
                    this.view.setInteractionEnabled(true);
                } else {
                    this.view.playAI();
                }
            } else {
                this.view.setInteractionEnabled(false);
            }
        }

        // Destroy the log processor
        destroy() {
            if (this.subscription) {
                this.log.unsubscribe(this.subscription);
                this.subscription = null;
                this.queue = [];
            }
        }

        // Playing ship changed
        private processShipChangeEvent(event: ShipChangeEvent): void {
            this.view.arena.setShipPlaying(event.new_ship);
            this.view.ship_list.setPlaying(event.new_ship);
            if (event.ship !== event.new_ship) {
                this.view.gameui.audio.playOnce("battle-ship-change");
            }
        }

        // Damage to ship
        private processDamageEvent(event: DamageEvent): void {
            var item = this.view.ship_list.findItem(event.ship);
            if (item) {
                item.setDamageHit();
            }
        }

        // A ship died
        private processDeathEvent(event: DeathEvent): void {
            if (this.view.ship_hovered === event.ship) {
                this.view.setShipHovered(null);
            }
            this.view.arena.markAsDead(event.ship);
            this.view.ship_list.markAsDead(event.ship);

            if (!event.initial) {
                this.delayNextEvents(1000);
            }
        }

        // Weapon used
        private processFireEvent(event: FireEvent): void {
            var source = Target.newFromShip(event.ship);
            var destination = event.target;

            var effect = new WeaponEffect(this.view.arena, source, destination, event.weapon);
            let duration = effect.start();

            this.delayNextEvents(duration);
        }

        // Battle ended (victory or defeat)
        private processEndBattleEvent(event: EndBattleEvent): void {
            this.view.endBattle();
            this.destroy();
        }

        // New drone deployed
        private processDroneDeployedEvent(event: DroneDeployedEvent): void {
            let duration = this.view.arena.addDrone(event.drone, !event.initial);

            if (duration) {
                this.view.gameui.audio.playOnce("battle-drone-deploy");
            }

            this.delayNextEvents(duration);
        }

        // Drone destroyed
        private processDroneDestroyedEvent(event: DroneDestroyedEvent): void {
            this.view.arena.removeDrone(event.drone);
            if (!event.initial) {
                this.view.gameui.audio.playOnce("battle-drone-destroy");
                this.delayNextEvents(1000);
            }
        }

        // Drone applied
        private processDroneAppliedEvent(event: DroneAppliedEvent): void {
            let drone = this.view.arena.findDrone(event.drone);
            if (drone) {
                let duration = drone.setApplied();

                if (duration) {
                    this.view.gameui.audio.playOnce("battle-drone-activate");
                }

                this.delayNextEvents(duration);
            }
        }
    }
}
