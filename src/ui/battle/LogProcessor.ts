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

        // Forward diffs to other subscribers
        private forwarding: ((diff: BaseBattleDiff) => number)[] = []

        // Debug indicators
        private debug = false
        private ai_disabled = false

        // Time at which the last action was applied
        private last_action: number

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
                    this.transferControl();
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
                this.transferControl();
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
         * Register a sub-subscriber.
         * 
         * The difference with registering directly to the BattleLog is that diffs may add delay
         * for animations.
         * 
         * The callback may return the duration it needs to display the change.
         */
        register(callback: (diff: BaseBattleDiff) => number) {
            this.forwarding.push(callback);
        }

        /**
         * Register a sub-subscriber, to receive diffs for a specific ship
         */
        registerForShip(ship: Ship, callback: (diff: BaseBattleShipDiff) => number) {
            this.register(event => {
                if (event instanceof BaseBattleShipDiff && event.ship_id === ship.id) {
                    return callback(event);
                } else {
                    return 0;
                }
            });
        }

        /**
         * Register to playing ship changes
         */
        watchForShipChange(callback: (ship: Ship) => number, initial = true) {
            this.register(diff => {
                if (diff instanceof ShipChangeDiff) {
                    let ship = this.view.battle.playing_ship;
                    if (ship) {
                        return callback(ship);
                    }
                }
                return 0;
            });

            if (initial) {
                let ship = this.view.battle.playing_ship;
                if (ship) {
                    callback(ship);
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

            let durations = this.forwarding.map(subscriber => subscriber(diff));
            let t = (new Date()).getTime()

            if (diff instanceof ShipActionUsedDiff) {
                let ship = this.view.actual_battle.getShip(diff.ship_id);
                if (ship) {
                    if (!ship.getPlayer().is(this.view.player)) {
                        // AI is playing, do not make it play too fast
                        let since_last = t - this.last_action;
                        if (since_last < 2000) {
                            durations.push(2000 - since_last);
                        }
                    }
                }
                this.last_action = t;
            } else if (diff instanceof ProjectileFiredDiff) {
                let ship = this.view.battle.getShip(diff.ship_id);
                if (ship) {
                    let equipment = ship.getEquipment(diff.equipment);
                    if (equipment && equipment.slot_type == SlotType.Weapon) {
                        let effect = new WeaponEffect(this.view.arena, ship, diff.target, equipment);
                        durations.push(effect.start());
                    }
                }
            } else if (diff instanceof ShipChangeDiff) {
                durations.push(this.processShipChangeEvent(diff));
            } else if (diff instanceof ShipDeathDiff) {
                durations.push(this.processDeathEvent(diff));
            } else if (diff instanceof ShipDamageDiff) {
                durations.push(this.processDamageEvent(diff));
            } else if (diff instanceof EndBattleDiff) {
                durations.push(this.processEndBattleEvent(diff));
            } else if (diff instanceof DroneDeployedDiff) {
                durations.push(this.processDroneDeployedEvent(diff));
            } else if (diff instanceof DroneDestroyedDiff) {
                durations.push(this.processDroneDestroyedEvent(diff));
            } else if (diff instanceof DroneAppliedDiff) {
                durations.push(this.processDroneAppliedEvent(diff));
            }

            let delay = max([0].concat(durations));
            if (delay && timed) {
                await this.view.timer.sleep(delay);
            }

            if (this.log.isPlaying()) {
                let reaction = this.view.session.reactions.check(this.view.player, this.view.battle, this.view.battle.playing_ship, diff);
                if (reaction) {
                    await this.processReaction(reaction);
                }
            }
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
         * Process a personality reaction
         */
        private async processReaction(reaction: PersonalityReaction): Promise<void> {
            if (reaction instanceof PersonalityReactionConversation) {
                let conversation = UIConversation.newFromPieces(this.view, reaction.messages);
                await conversation.waitEnd();
            } else {
                console.warn("[LogProcessor] Unknown personality reaction type", reaction);
            }
        }

        // Playing ship changed
        private processShipChangeEvent(event: ShipChangeDiff): number {
            this.view.ship_list.refresh();
            if (event.ship_id != event.new_ship) {
                this.view.audio.playOnce("battle-ship-change");
            }
            return 0;
        }

        // Damage to ship
        private processDamageEvent(event: ShipDamageDiff): number {
            var item = this.view.ship_list.findItem(event.ship_id);
            if (item) {
                item.setDamageHit();
            }
            return 0;
        }

        // A ship died
        private processDeathEvent(event: ShipDeathDiff): number {
            let ship = this.view.battle.getShip(event.ship_id);

            if (ship) {
                if (this.view.ship_hovered === ship) {
                    this.view.setShipHovered(null);
                }
                this.view.arena.markAsDead(ship);
                this.view.ship_list.refresh();

                return 3000;
            } else {
                return 0;
            }
        }

        // Battle ended (victory or defeat)
        private processEndBattleEvent(event: EndBattleDiff): number {
            this.view.endBattle();
            return 0;
        }

        // New drone deployed
        private processDroneDeployedEvent(event: DroneDeployedDiff): number {
            let duration = this.view.arena.addDrone(event.drone);

            if (duration) {
                this.view.gameui.audio.playOnce("battle-drone-deploy");
            }

            return duration;
        }

        // Drone destroyed
        private processDroneDestroyedEvent(event: DroneDestroyedDiff): number {
            let duration = this.view.arena.removeDrone(event.drone);

            if (duration) {
                this.view.gameui.audio.playOnce("battle-drone-destroy");
            }

            return duration;
        }

        // Drone applied
        private processDroneAppliedEvent(event: DroneAppliedDiff): number {
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
