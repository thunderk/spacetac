module TK.SpaceTac.UI {
    /**
     * Ship sprite in the arena, with corresponding HUD
     */
    export class ArenaShip extends Phaser.Group {
        // Link to the view
        arena: Arena
        battleview: BattleView

        // Link to displayed ship
        ship: Ship

        // Boolean to indicate if it is an enemy ship
        enemy: boolean

        // Ship sprite
        sprite: Phaser.Image

        // Stasis effect
        stasis: Phaser.Image

        // HSP display
        hsp: Phaser.Image
        power_text: Phaser.Text
        life_hull: UIGroup
        life_shield: UIGroup
        life_evasion: UIGroup
        toggle_hsp: Toggle

        // Play order
        play_order: Phaser.Text
        toggle_play_order: Toggle

        // Frames to indicate the owner, if the ship is hovered, and if it is hovered
        frame_owner: UIImage
        frame_hover: UIImage

        // Effects display
        active_effects_display: Phaser.Group
        effects_radius: Phaser.Graphics
        effects_messages: Phaser.Group
        effects_messages_toggle: Toggle

        // Create a ship sprite usable in the Arena
        constructor(parent: Arena, ship: Ship) {
            super(parent.game);
            this.arena = parent;
            this.battleview = parent.view;
            let builder = new UIBuilder(parent.view).in(this);

            this.ship = ship;
            this.enemy = !this.battleview.player.is(this.ship.fleet.player);

            // Add effects radius
            this.effects_radius = new Phaser.Graphics(this.game);
            this.add(this.effects_radius);

            // Add frame indicating which side this ship is on
            this.frame_owner = builder.image(this.enemy ? "battle-hud-ship-enemy" : "battle-hud-ship-own", 0, 0, true);
            this.setPlaying(false);
            this.frame_hover = builder.image("battle-hud-ship-hover", 0, 0, true);
            this.frame_hover.visible = false;

            // Add ship sprite
            this.sprite = builder.image(`ship-${ship.model.code}-sprite`, 0, 0, true);
            this.sprite.rotation = ship.arena_angle;

            // Add stasis effect
            this.stasis = builder.image("battle-hud-ship-stasis", 0, 0, true);
            this.stasis.alpha = 0.9;
            this.stasis.visible = !ship.alive;

            // HSP display
            this.hsp = builder.image("battle-hud-hsp-background", 0, 34, true);
            this.power_text = builder.in(this.hsp).text(`${ship.getValue("power")}`, -42, 2,
                { size: 13, color: "#ffdd4b", bold: true, shadow: true, center: true });
            this.life_hull = builder.in(this.hsp).group("hull");
            this.life_shield = builder.in(this.hsp).group("shield");
            this.life_evasion = builder.in(this.hsp).group("evasion");
            this.toggle_hsp = this.battleview.animations.newVisibilityToggle(this.hsp, 200, false);

            // Play order display
            let play_order = builder.image("battle-hud-ship-play-order", -44, 0, true)
            this.play_order = builder.in(play_order).text("", -2, 3, { size: 12, bold: true, color: "#d1d1d1", shadow: true, center: true });
            this.toggle_play_order = this.battleview.animations.newVisibilityToggle(play_order, 200, false);

            // Effects display
            this.active_effects_display = new Phaser.Group(this.game);
            this.active_effects_display.position.set(0, -44);
            this.add(this.active_effects_display);
            this.effects_messages = new Phaser.Group(this.game);
            this.add(this.effects_messages);
            this.effects_messages_toggle = this.battleview.animations.newVisibilityToggle(this.effects_messages, 500, false);

            this.updatePlayOrder();
            this.updateHull(this.ship.getValue("hull"));
            this.updateShield(this.ship.getValue("shield"));
            this.updateEvasion(this.ship.getAttribute("evasion"));
            this.updateActiveEffects();
            this.updateEffectsRadius();

            // Set location
            if (this.battleview.battle.cycle == 1 && this.battleview.battle.play_index == 0 && ship.alive && this.battleview.player.is(ship.fleet.player)) {
                this.position.set(ship.arena_x - 500 * Math.cos(ship.arena_angle), ship.arena_y - 500 * Math.sin(ship.arena_angle));
                this.moveTo(ship.arena_x, ship.arena_y, ship.arena_angle);
            } else {
                this.moveTo(ship.arena_x, ship.arena_y, ship.arena_angle, false);
            }

            // Log processing
            this.battleview.log_processor.register(diff => this.processBattleDiff(diff));
            this.battleview.log_processor.registerForShip(ship, diff => this.processShipDiff(diff));
        }

        jasmineToString(): string {
            return `ArenaShip ${this.ship.jasmineToString()}`;
        }

        /**
         * Process a battle diff
         */
        private processBattleDiff(diff: BaseBattleDiff) {
            if (diff instanceof ShipChangeDiff) {
                this.updatePlayOrder();
            }
            return {};
        }

        /**
         * Process a ship diff
         */
        private processShipDiff(diff: BaseBattleShipDiff): LogProcessorDelegate {
            if (diff instanceof ShipEffectAddedDiff || diff instanceof ShipEffectRemovedDiff) {
                return {
                    background: async () => this.updateActiveEffects()
                }
            } else if (diff instanceof ShipValueDiff) {
                return {
                    background: async (animate, timer) => {
                        if (animate) {
                            this.toggle_hsp.manipulate("value")(true);
                        }

                        if (diff.code == "hull") {
                            if (animate) {
                                this.updateHull(this.ship.getValue("hull") - diff.diff, diff.diff);
                                await timer.sleep(1000);
                                this.updateHull(this.ship.getValue("hull"));
                                await timer.sleep(500);
                            } else {
                                this.updateHull(this.ship.getValue("hull"));
                            }
                        } else if (diff.code == "shield") {
                            if (animate) {
                                this.updateShield(this.ship.getValue("shield") - diff.diff, diff.diff);
                                await timer.sleep(1000);
                                this.updateShield(this.ship.getValue("shield"));
                                await timer.sleep(500);
                            } else {
                                this.updateShield(this.ship.getValue("shield"));
                            }
                        } else if (diff.code == "power") {
                            this.power_text.text = `${this.ship.getValue("power")}`;
                            if (animate) {
                                await this.battleview.animations.blink(this.power_text);
                            }
                        }

                        if (animate) {
                            await timer.sleep(500);
                            this.toggle_hsp.manipulate("value")(false);
                        }
                    }
                }
            } else if (diff instanceof ShipAttributeDiff) {
                return {
                    background: async (animate, timer) => {
                        if (animate) {
                            this.displayAttributeChanged(diff);
                            if (diff.code == "evasion") {
                                // TODO diff
                                this.updateEvasion(this.ship.getAttribute("evasion"));
                                this.toggle_hsp.manipulate("attribute")(2000);
                            }
                            await timer.sleep(2000);
                        }
                    }
                }
            } else if (diff instanceof ShipDamageDiff) {
                return {
                    background: async (animate, timer) => {
                        if (animate) {
                            await this.displayEffect(`${diff.theoretical} damage`, false);
                            await timer.sleep(1000);
                        }
                    }
                }
            } else if (diff instanceof ShipActionToggleDiff) {
                return {
                    foreground: async (animate, timer) => {
                        let action = this.ship.actions.getById(diff.action);
                        if (action) {
                            if (animate) {
                                if (diff.activated) {
                                    await this.displayEffect(`${action.name} ON`, true);
                                } else {
                                    await this.displayEffect(`${action.name} OFF`, false);
                                }
                            }

                            this.updateEffectsRadius();
                            await timer.sleep(500);
                        }
                    }
                }
            } else if (diff instanceof ShipActionUsedDiff) {
                let action = this.ship.actions.getById(diff.action);
                if (action) {
                    if (action instanceof EndTurnAction) {
                        return {
                            foreground: async (animate, timer) => {
                                if (animate) {
                                    await this.displayEffect("End turn", true);
                                    await timer.sleep(500);
                                }
                            }
                        }
                    } else if (!(action instanceof ToggleAction)) {
                        let action_name = action.name;
                        return {
                            foreground: async (animate, timer) => {
                                if (animate) {
                                    await this.displayEffect(action_name, true);
                                    await timer.sleep(300);
                                }
                            }
                        }
                    } else {
                        return {};
                    }
                } else {
                    return {};
                }
            } else if (diff instanceof ShipMoveDiff) {
                let func = async (animate: boolean, timer: Timer) => {
                    this.moveTo(diff.start.x, diff.start.y, diff.start.angle, false);
                    let duration = this.moveTo(diff.end.x, diff.end.y, diff.end.angle, animate, !!diff.engine);
                    if (duration && animate) {
                        await timer.sleep(duration);
                    }
                };
                if (diff.engine) {
                    return { foreground: func };
                } else {
                    return { background: func };
                }
            } else if (diff instanceof VigilanceAppliedDiff) {
                let action = this.ship.actions.getById(diff.action);
                return {
                    foreground: async (animate, timer) => {
                        if (animate && action) {
                            await this.displayEffect(`${action.name} (vigilance)`, true);
                            await timer.sleep(300);
                        }
                    }
                }
            } else {
                return {};
            }
        }

        /**
         * Set the hovered state on this ship
         * 
         * This will show the information HUD accordingly
         */
        setHovered(hovered: boolean, tactical: boolean) {
            let client = tactical ? "tactical" : "hover";

            if (hovered && this.ship.alive) {
                this.toggle_hsp.manipulate(client)(true);
                if (tactical) {
                    this.toggle_play_order.manipulate(client)(true);
                }
            } else {
                this.toggle_hsp.manipulate(client)(false);
                this.toggle_play_order.manipulate(client)(false);
            }

            this.battleview.animations.setVisible(this.frame_hover, hovered && this.ship.alive && !tactical, 200);
        }

        /**
         * Set the playing state on this ship
         * 
         * This will alter the HUD frame to show this state
         */
        async setPlaying(playing: boolean, animate = true): Promise<void> {
            this.frame_owner.alpha = playing ? 1 : 0.35;
            this.frame_owner.visible = this.ship.alive;

            if (playing && animate) {
                this.battleview.audio.playOnce("battle-ship-change");
                await this.battleview.animations.blink(this.frame_owner);
            }
        }

        /**
         * Activate the dead effect (stasis)
         */
        setDead(dead = true) {
            if (dead) {
                //this.displayEffect("stasis", false);
                this.stasis.visible = true;
                this.stasis.alpha = 0;
                this.battleview.animations.blink(this.stasis, 0.9, 0.7);
            } else {
                this.stasis.visible = false;
            }
            this.setPlaying(false);
        }

        /**
         * Move the sprite to a location
         * 
         * Return the duration of animation
         */
        moveTo(x: number, y: number, facing_angle: number, animate = true, engine = true): number {
            if (animate) {
                let animation = engine ? Animations.moveInSpace : Animations.moveTo;
                let duration = animation(this, x, y, facing_angle, this.sprite);
                return duration;
            } else {
                this.x = x;
                this.y = y;
                this.sprite.rotation = facing_angle;
                return 0;
            }
        }

        /**
         * Briefly show an effect on this ship
         */
        async displayEffect(message: string, beneficial: boolean) {
            if (!this.effects_messages.visible) {
                this.effects_messages.removeAll(true);
            }

            let text = new Phaser.Text(this.game, 0, 20 * this.effects_messages.children.length, message, { font: "14pt SpaceTac", fill: beneficial ? "#afe9c6" : "#e9afaf" });
            this.effects_messages.addChild(text);

            let arena = this.battleview.arena.getBoundaries();
            this.effects_messages.position.set(
                (this.ship.arena_x < 100) ? -35 : ((this.ship.arena_x > arena.width - 100) ? (35 - this.effects_messages.width) : (-this.effects_messages.width * 0.5)),
                (this.ship.arena_y < arena.height * 0.9) ? 50 : (-50 - this.effects_messages.height)
            );

            this.effects_messages_toggle.manipulate("added")(1400);
            await this.battleview.timer.sleep(1500);
        }

        /**
         * Display interesting changes in ship attributes
         */
        displayAttributeChanged(event: ShipAttributeDiff) {
            // TODO show final diff, not just cumulative one
            let diff = (event.added.cumulative || 0) - (event.removed.cumulative || 0);
            if (diff) {
                let name = SHIP_VALUES_NAMES[event.code];
                this.displayEffect(`${name} ${diff < 0 ? "-" : "+"}${Math.abs(diff)}`, diff >= 0);
            }
        }

        /**
         * Update the play order indicator
         */
        updatePlayOrder(): void {
            let play_order = this.battleview.battle.getPlayOrder(this.ship);
            if (play_order == 0) {
                this.play_order.text = "-";
            } else {
                this.play_order.text = play_order.toString();
            }
        }

        /**
         * Reposition the HSP indicators
         */
        repositionLifeIndicators(): void {
            this.life_hull.x = -25;
            this.life_shield.x = this.life_hull.x + (this.life_hull.length * 9);
            this.life_evasion.x = this.life_shield.x + (this.life_shield.length * 9);
        }

        /**
         * Update the hull indicator
         */
        updateHull(current: number, diff = 0): void {
            let builder = new UIBuilder(this.battleview, this.life_hull);
            builder.clear();

            range(current).forEach(i => {
                builder.image("battle-hud-hsp-hull", i * 9, 0, true);
            });

            this.repositionLifeIndicators();
        }

        /**
         * Update the shield indicator
         */
        updateShield(current: number, diff = 0): void {
            let builder = new UIBuilder(this.battleview, this.life_shield);
            builder.clear();

            range(current).forEach(i => {
                builder.image("battle-hud-hsp-shield", i * 9, 0, true);
            });

            this.repositionLifeIndicators();
        }

        /**
         * Update the evasion indicator
         */
        updateEvasion(current: number, diff = 0): void {
            let builder = new UIBuilder(this.battleview, this.life_evasion);
            builder.clear();

            range(current).forEach(i => {
                builder.image("battle-hud-hsp-evasion", i * 9, 0, true);
            });

            this.repositionLifeIndicators();
        }

        /**
         * Update the list of effects active on the ship
         */
        updateActiveEffects() {
            this.active_effects_display.removeAll();

            let effects = this.ship.active_effects.list().filter(effect => !effect.isInternal());

            let count = effects.length;
            if (count) {
                let positions = UITools.evenlySpace(70, 17, count);

                effects.forEach((effect, index) => {
                    let name = effect.isBeneficial() ? "battle-hud-ship-effect-good" : "battle-hud-ship-effect-bad";
                    let dot = this.battleview.newImage(name, positions[index] - 35, 0);
                    dot.anchor.set(0.5, 0.5);
                    this.active_effects_display.add(dot);
                });
            }
        }

        /**
         * Update the activated effects radius
         */
        updateEffectsRadius(): void {
            this.effects_radius.clear();
            this.ship.actions.listToggled().forEach(action => {
                let color = (action instanceof VigilanceAction) ? 0xf4bf42 : 0xe9f2f9;
                this.effects_radius.lineStyle(2, color, 0.5);
                this.effects_radius.beginFill(color, 0.1);
                this.effects_radius.drawCircle(0, 0, action.radius * 2);
                this.effects_radius.endFill();
            });
        }
    }
}
