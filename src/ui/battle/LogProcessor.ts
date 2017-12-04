module TK.SpaceTac.UI {
    /**
     * Processor of diffs coming from the battle log
     * 
     * This will bind to the actual battle log, update the "displayed" battle state accordingly, and refresh the view.
     */
    export class LogProcessor {
        // Link to the battle view
        private view: BattleView

        // Log client (to receive actual battle diffs)
        private log: BattleLogClient

        // Registered subscribers
        private subscriber: LogProcessorSubscriber[] = []

        // Background delegates promises
        private background_promises: Promise<void>[] = []

        // Debug indicators
        private debug = false
        private ai_disabled = false

        constructor(view: BattleView) {
            this.view = view;
            this.log = new BattleLogClient(view.battle, view.actual_battle.log);

            view.inputs.bindCheat("PageUp", "Step backward", () => {
                this.log.backward();
            });
            view.inputs.bindCheat("PageDown", "Step forward", () => {
                this.log.forward();
            });
            view.inputs.bindCheat("Home", "Jump to beginning", () => {
                this.log.jumpToStart();
            });
            view.inputs.bindCheat("End", "Jump to end", () => {
                this.log.jumpToEnd();
            });

            // Internal subscribers
            this.register((diff) => this.checkReaction(diff));
            this.register((diff) => this.checkControl(diff));
            this.register((diff) => this.checkProjectileFired(diff));
            this.register((diff) => this.checkShipDeath(diff));
            this.register((diff) => this.checkBattleEnded(diff));
            this.register((diff) => this.checkDroneDeployed(diff));
            this.register((diff) => this.checkDroneRecalled(diff));
        }

        /**
         * Start log processing
         */
        start() {
            if (!this.view.gameui.headless) {
                this.log.play(async diff => {
                    while (this.view.game.paused) {
                        await this.view.timer.sleep(500);
                    }

                    await this.processBattleDiff(diff);
                });

                this.transferControl();
            }
        }

        /**
         * Process all pending diffs, synchronously
         */
        processPending() {
            if (this.log.isPlaying()) {
                throw new Error("Cannot process diffs synchronously while playing the log");
            } else {
                let diff: Diff<Battle> | null;
                while (diff = this.log.forward()) {
                    this.processBattleDiff(diff, false);
                }
            }
        }

        /**
         * Destroy the processor
         * 
         * This should be done to ensure it will stop processing and free resources
         */
        destroy() {
            if (this.log.isPlaying()) {
                this.log.stop(true);
            }
        }

        /**
         * Check if we need a player or AI to interact at this point
         */
        getPlayerNeeded(): Player | null {
            if (this.log.isPlaying() && this.log.atEnd()) {
                let playing_ship = this.view.actual_battle.playing_ship;
                return playing_ship ? playing_ship.getPlayer() : null;
            } else {
                return null;
            }
        }

        /**
         * Register a diff subscriber
         */
        register(subscriber: LogProcessorSubscriber) {
            this.subscriber.push(subscriber);
        }

        /**
         * Register a diff for a specific ship
         */
        registerForShip(ship: Ship, subscriber: (diff: BaseBattleShipDiff) => LogProcessorDelegate) {
            this.register(diff => {
                if (diff instanceof BaseBattleShipDiff && diff.ship_id === ship.id) {
                    return subscriber(diff);
                } else {
                    return {};
                }
            });
        }

        /**
         * Register to playing ship changes
         * 
         * If *initial* is true, the callback will be fired once at register time
         * 
         * If *immediate* is true, the ShipChangeDiff is watched, otherwise the end of the EndTurn action
         */
        watchForShipChange(callback: (ship: Ship) => LogProcessorDelegate, initial = true, immediate = false) {
            this.register(diff => {
                let changed = false;
                if (immediate && diff instanceof ShipChangeDiff) {
                    changed = true;
                } else if (!immediate && diff instanceof ShipActionEndedDiff) {
                    let ship = this.view.battle.getShip(diff.ship_id);
                    if (ship && ship.getAction(diff.action) instanceof EndTurnAction) {
                        changed = true;
                    }
                }

                if (changed) {
                    let ship = this.view.battle.playing_ship;
                    if (ship) {
                        return callback(ship);
                    } else {
                        return {};
                    }
                } else {
                    return {};
                }
            });

            if (initial) {
                let ship = this.view.battle.playing_ship;
                if (ship) {
                    let result = callback(ship);
                    let timer = new Timer(true);
                    if (result.foreground) {
                        let promise = result.foreground(false, timer);
                        if (result.background) {
                            let next = result.background;
                            promise.then(() => next(false, timer));
                        }
                    } else if (result.background) {
                        result.background(false, timer);
                    }
                }
            }
        }

        /**
         * Process a single battle diff
         */
        async processBattleDiff(diff: BaseBattleDiff, timed = true): Promise<void> {
            if (this.debug) {
                console.log("Battle diff", diff);
            }
            let timer = timed ? this.view.timer : new Timer(true);

            // TODO add priority to sort the delegates
            let delegates = this.subscriber.map(subscriber => subscriber(diff));
            let foregrounds = nna(delegates.map(delegate => delegate.foreground || null));
            let backgrounds = nna(delegates.map(delegate => delegate.background || null));

            if (foregrounds.length > 0) {
                if (this.background_promises.length > 0) {
                    await Promise.all(this.background_promises);
                    this.background_promises = [];
                }

                let promises = foregrounds.map(foreground => foreground(timed, timer));
                await Promise.all(promises);
            }

            let promises = backgrounds.map(background => background(timed, timed ? this.view.timer : new Timer(true)));
            this.background_promises = this.background_promises.concat(promises);
        }

        /**
         * Transfer control to the needed player (or not)
         */
        private transferControl() {
            let player = this.getPlayerNeeded();
            if (player) {
                if (player.is(this.view.player)) {
                    this.view.setInteractionEnabled(true);
                } else if (!this.ai_disabled) {
                    this.view.playAI();
                } else {
                    this.view.applyAction(EndTurnAction.SINGLETON);
                }
            } else {
                this.view.setInteractionEnabled(false);
            }
        }

        /**
         * Check if a personality reaction should be triggered for a diff
         */
        private checkReaction(diff: BaseBattleDiff): LogProcessorDelegate {
            if (this.log.isPlaying()) {
                let reaction = this.view.session.reactions.check(this.view.player, this.view.battle, this.view.battle.playing_ship, diff);
                if (reaction) {
                    return {
                        foreground: async () => {
                            if (reaction instanceof PersonalityReactionConversation) {
                                let conversation = UIConversation.newFromPieces(this.view, reaction.messages);
                                await conversation.waitEnd();
                            } else {
                                console.warn("[LogProcessor] Unknown personality reaction type", reaction);
                            }
                        }
                    };
                }
            }

            return {};
        }

        /**
         * Check if control should be transferred to the player, or an AI, after a diff
         */
        private checkControl(diff: BaseBattleDiff): LogProcessorDelegate {
            if (diff instanceof ShipActionEndedDiff) {
                return {
                    foreground: async () => this.transferControl()
                }
            } else {
                return {};
            }
        }

        /**
         * Check if a projectile is fired
         */
        private checkProjectileFired(diff: BaseBattleDiff): LogProcessorDelegate {
            if (diff instanceof ProjectileFiredDiff) {
                let ship = this.view.battle.getShip(diff.ship_id);
                if (ship) {
                    let equipment = ship.getEquipment(diff.equipment);
                    if (equipment && equipment.slot_type == SlotType.Weapon) {
                        let effect = new WeaponEffect(this.view.arena, ship, diff.target, equipment);
                        return {
                            foreground: async (animate, timer) => {
                                if (animate) {
                                    await this.view.timer.sleep(effect.start())
                                }
                            }
                        }
                    }
                }
            }

            return {};
        }

        /**
         * Check if a ship died
         */
        private checkShipDeath(diff: BaseBattleDiff): LogProcessorDelegate {
            if (diff instanceof ShipDeathDiff) {
                let ship = this.view.battle.getShip(diff.ship_id);

                if (ship) {
                    let dead_ship = ship;
                    return {
                        foreground: async (animate) => {
                            if (dead_ship.is(this.view.ship_hovered)) {
                                this.view.setShipHovered(null);
                            }
                            this.view.arena.markAsDead(dead_ship);
                            this.view.ship_list.refresh();
                            if (animate) {
                                await this.view.timer.sleep(2000);
                            }
                        }
                    }
                }
            }

            return {};
        }

        /**
         * Check if the battle ended
         */
        private checkBattleEnded(diff: BaseBattleDiff): LogProcessorDelegate {
            if (diff instanceof EndBattleDiff) {
                return {
                    foreground: async () => this.view.endBattle()
                }
            }

            return {};
        }

        /**
         * Check if a new drone as been deployed
         */
        private checkDroneDeployed(diff: BaseBattleDiff): LogProcessorDelegate {
            if (diff instanceof DroneDeployedDiff) {
                return {
                    foreground: async (animate) => {
                        let duration = this.view.arena.addDrone(diff.drone, animate);
                        if (duration) {
                            this.view.gameui.audio.playOnce("battle-drone-deploy");
                            if (animate) {
                                await this.view.timer.sleep(duration);
                            }
                        }
                    }
                }
            } else {
                return {};
            }
        }

        /**
         * Check if a drone as been recalled
         */
        private checkDroneRecalled(diff: BaseBattleDiff): LogProcessorDelegate {
            if (diff instanceof DroneRecalledDiff) {
                return {
                    foreground: async () => {
                        let duration = this.view.arena.removeDrone(diff.drone);
                        if (duration) {
                            this.view.gameui.audio.playOnce("battle-drone-destroy");
                            await this.view.timer.sleep(duration);
                        }
                    }
                }
            } else {
                return {};
            }
        }

        // Drone applied
        /*private processDroneAppliedEvent(event: DroneAppliedDiff): number {
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
        }*/
    }

    /**
     * Effective work done by a subscriber
     * 
     * *foreground* is started when no other delegate (background or foreground) is working
     * *background* is started when no other foreground delegate is working or pending
     */
    export type LogProcessorDelegate = {
        foreground?: (animate: boolean, timer: Timer) => Promise<void>,
        background?: (animate: boolean, timer: Timer) => Promise<void>,
    }

    /**
     * Subscriber to receive diffs from the battle log
     */
    type LogProcessorSubscriber = (diff: BaseBattleDiff) => LogProcessorDelegate
}
