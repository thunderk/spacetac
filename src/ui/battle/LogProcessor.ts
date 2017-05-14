module TS.SpaceTac.UI {
    // Processor of battle log events
    //  This will process incoming battle events, and update the battleview accordingly
    export class LogProcessor {
        // Link to the battle view
        private view: BattleView;

        // Link to the battle
        private battle: Battle;

        // Link to the battle log
        private log: BattleLog;

        // Subscription identifier
        private subscription: any = null;

        // Delay before processing next events
        private delayed = false;

        // Processing queue, when delay is active
        private queue: BaseLogEvent[] = [];

        // Forward events to other subscribers
        private forwarding: LogSubscriber[] = [];

        constructor(view: BattleView) {
            this.view = view;
            this.battle = view.battle;
            this.log = view.battle.log;
        }

        /**
         * Start log processing
         */
        start() {
            this.subscription = this.log.subscribe(event => this.processBattleEvent(event));
            this.battle.injectInitialEvents();
        }

        /**
         * Register a sub-subscriber.
         * 
         * The difference with registering directly to the BattleLog is that events may be delayed
         * for animations.
         */
        register(callback: LogSubscriber) {
            this.forwarding.push(callback);
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
        processBattleEvent(event: BaseLogEvent) {
            if (!this.subscription) {
                return;
            }

            if (this.delayed) {
                this.queue.push(event);
                return;
            }

            console.log("Battle event", event);

            this.forwarding.forEach(subscriber => subscriber(event));

            if (event instanceof ShipChangeEvent) {
                this.processShipChangeEvent(event);
            } else if (event instanceof MoveEvent) {
                this.processMoveEvent(event);
            } else if (event instanceof ValueChangeEvent) {
                this.processValueChangedEvent(event);
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
            } else if (event instanceof EffectAddedEvent || event instanceof EffectRemovedEvent || event instanceof EffectDurationChangedEvent) {
                this.processEffectEvent(event);
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

            if (this.battle.canPlay(this.view.player)) {
                // Player turn
                this.view.setInteractionEnabled(true);
            } else {
                this.view.setInteractionEnabled(false);
                if (event.new_ship.isAbleToPlay()) {
                    // AI turn
                    this.battle.playAI();
                } else {
                    // Ship unable to play, skip turn
                    this.view.timer.schedule(event.new_ship.alive ? 2000 : 500, () => {
                        this.battle.advanceToNextShip();
                    });
                }
            }
        }

        // Damage to ship
        private processDamageEvent(event: DamageEvent): void {
            var item = this.view.ship_list.findItem(event.ship);
            if (item) {
                item.setDamageHit();
            }
        }

        // Ship moved
        private processMoveEvent(event: MoveEvent): void {
            var sprite = this.view.arena.findShipSprite(event.ship);
            if (sprite) {
                let duration = sprite.moveTo(event.target.x, event.target.y, event.facing_angle, !event.initial);
                this.delayNextEvents(duration);
            }
        }

        // Ship value changed
        private processValueChangedEvent(event: ValueChangeEvent): void {
            var sprite = this.view.arena.findShipSprite(event.ship);
            if (sprite) {
                sprite.displayValueChanged(event);
            }

            // TODO Update tooltip
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

        // Sticky effect on ship added, changed or removed
        private processEffectEvent(event: EffectAddedEvent | EffectRemovedEvent | EffectDurationChangedEvent): void {
            // TODO
        }

        // New drone deployed
        private processDroneDeployedEvent(event: DroneDeployedEvent): void {
            let duration = this.view.arena.addDrone(event.drone, !event.initial);
            this.delayNextEvents(duration);
        }

        // Drone destroyed
        private processDroneDestroyedEvent(event: DroneDestroyedEvent): void {
            this.view.arena.removeDrone(event.drone);
        }

        // Drone applied
        private processDroneAppliedEvent(event: DroneAppliedEvent): void {
            let drone = this.view.arena.findDrone(event.drone);
            if (drone) {
                let duration = drone.setApplied();
                this.delayNextEvents(duration);
            }
        }
    }
}
