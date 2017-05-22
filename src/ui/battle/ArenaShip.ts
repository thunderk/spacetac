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

        // Target effect
        target: Phaser.Image

        // Hover information
        info: Phaser.Group
        info_hull: ValueBar
        info_shield: ValueBar
        info_toggle: Toggle

        // Frame to indicate the owner of the ship, and if it is playing
        frame: Phaser.Image

        // Effects display
        sticky_effects: Phaser.Group
        effects: Phaser.Group

        // Create a ship sprite usable in the Arena
        constructor(parent: Arena, ship: Ship) {
            super(parent.game);
            this.arena = parent;
            this.battleview = parent.battleview;

            this.ship = ship;
            this.enemy = this.ship.getPlayer() != this.battleview.player;

            // Add ship sprite
            this.sprite = new Phaser.Button(this.game, 0, 0, "ship-" + ship.model.code + "-sprite");
            this.sprite.rotation = ship.arena_angle;
            this.sprite.anchor.set(0.5, 0.5);
            this.sprite.scale.set(64 / this.sprite.width);
            this.add(this.sprite);

            // Add stasis effect
            this.stasis = new Phaser.Image(this.game, 0, 0, "battle-arena-stasis");
            this.stasis.anchor.set(0.5, 0.5);
            this.stasis.visible = false;
            this.add(this.stasis);

            // Add target effect
            this.target = new Phaser.Image(this.game, 0, 0, "battle-arena-target");
            this.target.anchor.set(0.5, 0.5);
            this.target.visible = false;
            this.add(this.target);

            // Add playing effect
            this.frame = new Phaser.Image(this.game, 0, 0, `battle-arena-ship-normal-${this.enemy ? "enemy" : "own"}`, 0);
            this.frame.anchor.set(0.5, 0.5);
            this.add(this.frame);

            // Hover informations
            this.info = new Phaser.Group(this.game);
            this.info_hull = new ValueBar(this.game, -59, -47, "battle-arena-ship-hull-base", true);
            this.info_hull.setBarImage("battle-arena-ship-hull-full", 3);
            this.info_hull.setValue(this.ship.getValue("hull"), this.ship.getAttribute("hull_capacity"));
            this.info.add(this.info_hull);
            this.info_shield = new ValueBar(this.game, 40, -47, "battle-arena-ship-shield-base", true);
            this.info_shield.setBarImage("battle-arena-ship-shield-full", 3);
            this.info_shield.setValue(this.ship.getValue("shield"), this.ship.getAttribute("shield_capacity"));
            this.info.add(this.info_shield);
            this.info.visible = false;
            this.info_toggle = this.battleview.animations.newVisibilityToggle(this.info, 200);
            this.add(this.info);

            // Effects display
            this.sticky_effects = new Phaser.Group(this.game);
            this.add(this.sticky_effects);
            this.effects = new Phaser.Group(this.game);
            this.add(this.effects);

            // Handle input on ship sprite
            UITools.setHoverClick(this.sprite,
                () => this.battleview.cursorOnShip(ship),
                () => this.battleview.cursorOffShip(ship),
                () => this.battleview.cursorClicked()
            );

            // Set location
            this.position.set(ship.arena_x - 150 * Math.cos(ship.arena_angle), ship.arena_y - 150 * Math.sin(ship.arena_angle));
            this.moveTo(ship.arena_x, ship.arena_y, ship.arena_angle);

            // Log processing
            this.battleview.log_processor.registerForShip(ship, event => this.processLogEvent(event));
        }

        /**
         * Process a log event for this ship
         */
        private processLogEvent(event: BaseLogEvent): number {
            if (event instanceof EffectAddedEvent || event instanceof EffectRemovedEvent || event instanceof EffectDurationChangedEvent) {
                this.updateStickyEffects();
                return 0;
            } else if (event instanceof ValueChangeEvent) {
                if (event.value.name == "hull") {
                    this.info_toggle.start(1500, true);
                    this.info_hull.setValue(event.value.get(), event.value.getMaximal() || 0);
                    return 0;
                } else if (event.value.name == "shield") {
                    this.info_toggle.start(1500, true);
                    this.info_shield.setValue(event.value.get(), event.value.getMaximal() || 0);
                    return 0;
                } else {
                    this.displayValueChanged(event);
                    return 0;
                }
            } else if (event instanceof DamageEvent) {
                this.displayEffect(`${event.hull + event.shield} damage`, false);
                return 0;
            } else if (event instanceof MoveEvent) {
                let duration = this.moveTo(event.target.x, event.target.y, event.facing_angle, !event.initial);
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
        setHovered(hovered: boolean) {
            if (hovered && this.ship.alive) {
                this.info_toggle.start();
            } else {
                this.info_toggle.stop();
            }
        }

        // Set the playing state on this ship
        //  This will toggle the "playing" indicator
        setPlaying(playing: boolean) {
            this.frame.loadTexture(`battle-arena-ship-${playing ? "playing" : "normal"}-${this.enemy ? "enemy" : "own"}`);
        }

        /**
         * Set the ship as target of current action
         * 
         * This will toggle the visibility of target indicator
         */
        setTargetted(targetted: boolean): void {
            this.target.visible = targetted;
        }

        /**
         * Activate the dead effect (stasis)
         */
        setDead(dead = true) {
            if (dead) {
                this.displayEffect("stasis", false);
            }
            this.frame.alpha = dead ? 0.5 : 1.0;
            this.battleview.animations.setVisible(this.stasis, dead, 400);
        }

        /**
         * Move the sprite to a location
         * 
         * Return the duration of animation
         */
        moveTo(x: number, y: number, facing_angle: number, animate = true): number {
            if (animate) {
                let duration = Animations.moveInSpace(this, x, y, facing_angle, this.sprite);
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
            let text = new Phaser.Text(this.game, 0, 20 * this.effects.children.length, message, { font: "14pt Arial", fill: beneficial ? "#afe9c6" : "#e9afaf" });
            this.effects.addChild(text);

            let arena = this.battleview.arena.getBoundaries();
            this.effects.position.set(
                (this.ship.arena_x < 100) ? -35 : ((this.ship.arena_x > arena.width - 100) ? (35 - this.effects.width) : (-this.effects.width * 0.5)),
                (this.ship.arena_y < arena.height * 0.9) ? 40 : (-40 - this.effects.height)
            );

            this.game.tweens.removeFrom(this.effects);
            this.effects.alpha = 1;
            let tween = this.game.tweens.create(this.effects).to({ alpha: 0 }, 500).delay(1000).start();
            tween.onComplete.addOnce(() => this.effects.removeAll(true));
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
         * Update the stick effects
         */
        updateStickyEffects() {
            this.sticky_effects.removeAll();

            let count = this.ship.sticky_effects.length
            if (count) {
                let positions = UITools.evenlySpace(70, 10, count);
                this.ship.sticky_effects.forEach((effect, index) => {
                    let dot = new Phaser.Image(this.game, positions[index] - 40, -47, `battle-arena-ship-effect-${effect.isBeneficial() ? "good" : "bad"}`);
                    this.sticky_effects.add(dot);
                });
            }
        }
    }
}
