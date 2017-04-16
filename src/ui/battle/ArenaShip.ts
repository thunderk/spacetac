module TS.SpaceTac.UI {
    // Ship sprite in the arena (BattleView)
    export class ArenaShip extends Phaser.Group {
        // Link to the view
        battleview: BattleView;

        // Link to displayed ship
        ship: Ship;

        // Boolean to indicate if it is an enemy ship
        enemy: boolean;

        // Ship sprite
        sprite: Phaser.Button;

        // Statis effect
        stasis: Phaser.Image;

        // Hover effect
        hover: Phaser.Image;

        // Frame to indicate the owner of the ship, and if it is playing
        frame: Phaser.Image;

        // Effects display
        effects: Phaser.Group;

        // Create a ship sprite usable in the Arena
        constructor(parent: Arena, ship: Ship) {
            super(parent.game);
            this.battleview = parent.battleview;

            this.ship = ship;
            this.enemy = this.ship.getPlayer() != this.battleview.player;

            // Add ship sprite
            this.sprite = new Phaser.Button(this.game, 0, 0, "ship-" + ship.model + "-sprite");
            this.sprite.rotation = ship.arena_angle;
            this.sprite.anchor.set(0.5, 0.5);
            this.sprite.scale.set(64 / this.sprite.width);
            this.addChild(this.sprite);

            // Add ship sprite
            this.stasis = new Phaser.Image(this.game, 0, 0, "battle-arena-stasis");
            this.stasis.anchor.set(0.5, 0.5);
            this.stasis.visible = false;
            this.addChild(this.stasis);

            // Add playing effect
            this.frame = new Phaser.Image(this.game, 0, 0, `battle-arena-ship-normal-${this.enemy ? "enemy" : "own"}`, 0);
            this.frame.anchor.set(0.5, 0.5);
            this.addChild(this.frame);

            // Add hover effect
            this.hover = new Phaser.Image(this.game, 0, 0, "battle-arena-ship-hover", 0);
            this.hover.anchor.set(0.5, 0.5);
            this.hover.visible = false;
            this.addChild(this.hover);

            // Effects display
            this.effects = new Phaser.Group(this.game);
            this.addChild(this.effects);

            // Handle input on ship sprite
            Tools.setHoverClick(this.sprite,
                () => this.battleview.cursorOnShip(ship),
                () => this.battleview.cursorOffShip(ship),
                () => this.battleview.cursorClicked()
            );

            // Set location
            this.position.set(ship.arena_x, ship.arena_y);
        }

        // Set the hovered state on this ship
        //  This will toggle the hover effect
        setHovered(hovered: boolean) {
            this.battleview.animations.setVisible(this.hover, hovered, 200);
        }

        // Set the playing state on this ship
        //  This will toggle the "playing" indicator
        setPlaying(playing: boolean) {
            this.frame.loadTexture(`battle-arena-ship-${playing ? "playing" : "normal"}-${this.enemy ? "enemy" : "own"}`);
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
                return Animations.moveInSpace(this, x, y, facing_angle, this.sprite);
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

            this.effects.position.set(-this.effects.width / 2, this.sprite.height * 0.8);

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
    }
}
