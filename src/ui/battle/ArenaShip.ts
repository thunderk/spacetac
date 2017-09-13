module TS.SpaceTac.UI {
    // Ship sprite in the arena (BattleView)
    export class ArenaShip extends Phaser.Group {
        // Link to the view
        arena: Arena
        battleview: BattleView

        // Link to displayed ship
        ship: Ship

        // Boolean to indicate if it is an enemy ship
        enemy: boolean

        // Ship sprite
        sprite: Phaser.Button

        // Statis effect
        stasis: Phaser.Image

        // HSP display
        hsp: Phaser.Image
        hull_bar: ValueBar
        hull_text: Phaser.Text
        shield_bar: ValueBar
        shield_text: Phaser.Text
        power_text: Phaser.Text
        toggle_hsp: Toggle

        // Play order
        play_order: Phaser.Text
        toggle_play_order: Toggle

        // Frame to indicate the owner of the ship, and if it is playing
        frame: Phaser.Image

        // Effects display
        active_effects: ActiveEffectsEvent
        active_effects_display: Phaser.Group
        effects_radius: Phaser.Graphics
        effects_messages: Phaser.Group
        effects_messages_toggle: Toggle

        // Create a ship sprite usable in the Arena
        constructor(parent: Arena, ship: Ship) {
            super(parent.game);
            this.arena = parent;
            this.battleview = parent.battleview;

            this.ship = ship;
            this.enemy = this.ship.getPlayer() != this.battleview.player;

            // Add effects radius
            this.effects_radius = new Phaser.Graphics(this.game);
            this.add(this.effects_radius);

            // Add frame indicating which side this ship is on
            this.frame = this.battleview.newImage(this.enemy ? "battle-hud-ship-enemy" : "battle-hud-ship-own");
            this.frame.anchor.set(0.5, 0.5);
            this.add(this.frame);
            this.setPlaying(false);

            // Add ship sprite
            let info = this.battleview.getImageInfo(`ship-${ship.model.code}-sprite`);
            this.sprite = new Phaser.Button(this.game, 0, 0, info.key, undefined, undefined, info.frame, info.frame);
            this.sprite.rotation = ship.arena_angle;
            this.sprite.anchor.set(0.5, 0.5);
            this.sprite.scale.set(0.4);
            this.add(this.sprite);

            // Add stasis effect
            this.stasis = this.battleview.newImage("battle-hud-ship-stasis");
            this.stasis.anchor.set(0.5, 0.5);
            this.stasis.visible = false;
            this.add(this.stasis);

            // HSP display
            this.hsp = this.battleview.newImage("battle-hud-ship-hsp", -50, 28);
            this.add(this.hsp);
            this.hull_bar = new ValueBar(this.battleview, "battle-hud-ship-hull", ValueBarOrientation.WEST, 48, 15);
            this.hull_bar.setValue(this.ship.getValue("hull"), this.ship.getAttribute("hull_capacity"));
            this.hsp.addChild(this.hull_bar.node);
            this.shield_bar = new ValueBar(this.battleview, "battle-hud-ship-shield", ValueBarOrientation.EAST, 53, 15);
            this.shield_bar.setValue(this.ship.getValue("shield"), this.ship.getAttribute("shield_capacity"));
            this.hsp.addChild(this.shield_bar.node);
            this.hull_text = new Phaser.Text(this.game, 0, 20, `${this.ship.getValue("hull")}`,
                { align: "left", font: "12pt SpaceTac", fill: "#eb4e4a" });
            this.hull_text.setShadow(1, 1, "#000000");
            this.hull_text.anchor.set(0, 1);
            this.hsp.addChild(this.hull_text);
            this.shield_text = new Phaser.Text(this.game, 104, 20, `${this.ship.getValue("shield")}`,
                { align: "right", font: "12pt SpaceTac", fill: "#2ad8dc" });
            this.shield_text.setShadow(1, 1, "#000000");
            this.shield_text.anchor.set(1, 1);
            this.hsp.addChild(this.shield_text);
            this.power_text = new Phaser.Text(this.game, 51, 10, `${this.ship.getValue("power")}`,
                { align: "center", font: "10pt SpaceTac", fill: "#ffdd4b" });
            this.power_text.setShadow(1, 1, "#000000");
            this.power_text.anchor.set(0.5, 0.5);
            this.hsp.addChild(this.power_text);
            this.toggle_hsp = this.battleview.animations.newVisibilityToggle(this.hsp, 200, false);

            // Play order display
            let play_order_bg = this.battleview.newImage("battle-hud-ship-play-order", -44, 0);
            play_order_bg.anchor.set(0.5, 0.5);
            this.play_order = new Phaser.Text(this.game, -2, 3, "", { font: "bold 12pt SpaceTac", fill: "#d1d1d1" });
            this.play_order.setShadow(1, 1, "#000000");
            this.play_order.anchor.set(0.5, 0.5);
            play_order_bg.addChild(this.play_order);
            this.toggle_play_order = this.battleview.animations.newVisibilityToggle(play_order_bg, 200, false);
            this.add(play_order_bg);

            // Effects display
            this.active_effects = new ActiveEffectsEvent(ship);
            this.active_effects_display = new Phaser.Group(this.game);
            this.active_effects_display.position.set(0, -44);
            this.add(this.active_effects_display);
            this.effects_messages = new Phaser.Group(this.game);
            this.add(this.effects_messages);
            this.effects_messages_toggle = this.battleview.animations.newVisibilityToggle(this.effects_messages, 500, false);

            this.updateActiveEffects();
            this.updateEffectsRadius();

            // Handle input on ship sprite
            UITools.setHoverClick(this.sprite,
                () => this.battleview.cursorOnShip(ship),
                () => this.battleview.cursorOffShip(ship),
                () => this.battleview.cursorClicked()
            );

            // Set location
            if (this.battleview.battle.turn == 1 && ship.alive && ship.fleet.player === this.battleview.player) {
                this.position.set(ship.arena_x - 500 * Math.cos(ship.arena_angle), ship.arena_y - 500 * Math.sin(ship.arena_angle));
                this.moveTo(ship.arena_x, ship.arena_y, ship.arena_angle);
            } else {
                this.moveTo(ship.arena_x, ship.arena_y, ship.arena_angle, false);
            }

            // Log processing
            this.battleview.log_processor.register(event => this.processLogEvent(event));
            this.battleview.log_processor.registerForShip(ship, event => this.processShipLogEvent(event));
        }

        /**
         * Process a battle log event
         */
        private processLogEvent(event: BaseBattleEvent): number {
            if (event instanceof ShipChangeEvent) {
                if (event.new_ship === this.ship) {
                    this.play_order.text = "-";
                } else {
                    this.play_order.text = this.battleview.battle.getTurnsBefore(this.ship).toString();
                }
            }
            return 0;
        }

        /**
         * Process a log event for this ship
         */
        private processShipLogEvent(event: BaseLogShipEvent): number {
            if (event instanceof ActiveEffectsEvent) {
                this.active_effects = event;
                this.updateActiveEffects();
                return 0;
            } else if (event instanceof ValueChangeEvent) {
                if (event.value.name == "hull") {
                    this.toggle_hsp.manipulate("value")(1500);
                    this.hull_bar.setValue(event.value.get(), event.value.getMaximal() || 0);
                    this.hull_text.text = `${event.value.get()}`;
                    return 0;
                } else if (event.value.name == "shield") {
                    this.toggle_hsp.manipulate("value")(1500);
                    this.shield_bar.setValue(event.value.get(), event.value.getMaximal() || 0);
                    this.shield_text.text = `${event.value.get()}`;
                    if (event.value.get() == 0) {
                        this.displayEffect("Shield failure", false);
                    }
                    return 0;
                } else if (event.value.name == "power") {
                    this.toggle_hsp.manipulate("value")(1500);
                    this.power_text.text = `${event.value.get()}`;
                    return 0;
                } else {
                    this.displayValueChanged(event);
                    return 0;
                }
            } else if (event instanceof DamageEvent) {
                this.displayEffect(`${event.hull + event.shield} damage`, false);
                return 0;
            } else if (event instanceof ToggleEvent) {
                if (event.action.equipment) {
                    let equname = event.action.equipment.name;
                    if (event.activated) {
                        this.displayEffect(`${equname} ON`, true);
                    } else {
                        this.displayEffect(`${equname} OFF`, false);
                    }
                    this.updateEffectsRadius();
                }
                return 0;
            } else if (event instanceof MoveEvent && !event.initial) {
                this.moveTo(event.start.x, event.start.y, event.start.angle, false);
                let duration = this.moveTo(event.end.x, event.end.y, event.end.angle, true, !!event.engine);
                return duration;
            } else {
                return 0;
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
        }

        /**
         * Set the playing state on this ship
         * 
         * This will alter the HUD frame to show this state
         */
        setPlaying(playing: boolean) {
            this.frame.alpha = playing ? 1 : 0.35;
            this.frame.visible = this.ship.alive;
        }

        /**
         * Activate the dead effect (stasis)
         */
        setDead(dead = true) {
            if (dead) {
                this.displayEffect("stasis", false);
            }
            this.setPlaying(false);
            this.battleview.animations.setVisible(this.stasis, dead, 400);
            this.alpha = dead ? 0.3 : 1;
        }

        /**
         * Check if the ship is dead
         */
        isDead(): boolean {
            return this.stasis.visible;
        }

        /**
         * Get a ship value
         */
        getValue(value: keyof ShipValues): number {
            switch (value) {
                case "hull":
                    return this.hull_bar.getValue();
                case "shield":
                    return this.shield_bar.getValue();
                default:
                    return 0;
            }
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
        displayEffect(message: string, beneficial: boolean) {
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

            this.effects_messages_toggle.manipulate("added")(1000);
        }

        /**
         * Display interesting changes in ship values
         */
        displayValueChanged(event: ValueChangeEvent) {
            let diff = event.diff;
            let name = event.value.name;
            this.displayEffect(`${name} ${diff < 0 ? "-" : "+"}${Math.abs(diff)}`, diff >= 0);
        }

        /**
         * Update the list of effects active on the ship
         */
        updateActiveEffects() {
            this.active_effects_display.removeAll();

            let effects = this.active_effects.sticky.map(sticky => sticky.base).concat(this.active_effects.area);

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
            this.ship.getAvailableActions().forEach(action => {
                if (action instanceof ToggleAction && action.activated) {
                    this.effects_radius.lineStyle(2, 0xe9f2f9, 0.3);
                    this.effects_radius.beginFill(0xe9f2f9, 0.0);
                    this.effects_radius.drawCircle(0, 0, action.radius * 2);
                    this.effects_radius.endFill();
                }
            });
        }
    }
}
