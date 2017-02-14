module TS.SpaceTac.UI {
    // Ship sprite in the arena (BattleView)
    export class ArenaShip extends Phaser.Group {
        // Link to displayed ship
        ship: Ship;

        // Boolean to indicate if it is an enemy ship
        enemy: boolean;

        // Ship sprite
        sprite: Phaser.Button;

        // Hover effect
        hover: Phaser.Image;

        // Frame to indicate the owner of the ship, and if it is playing
        frame: Phaser.Image;

        // Effects display
        effects: Phaser.Group;

        // Previous position
        private prevx;
        private prevy;

        // Create a ship sprite usable in the Arena
        constructor(parent: Arena, ship: Ship) {
            super(parent.game);
            let battleview = parent.battleview;

            this.ship = ship;
            this.enemy = this.ship.getPlayer() != battleview.player;

            // Add ship sprite
            this.sprite = new Phaser.Button(this.game, 0, 0, "ship-" + ship.model + "-sprite");
            this.sprite.rotation = ship.arena_angle;
            this.sprite.anchor.set(0.5, 0.5);
            this.addChild(this.sprite);

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
            Tools.setHoverClick(this.sprite, () => battleview.cursorOnShip(ship), () => battleview.cursorOffShip(ship), () => battleview.cursorClicked());

            // Set location
            this.prevx = ship.arena_x;
            this.prevy = ship.arena_y;
            this.position.set(ship.arena_x, ship.arena_y);
        }

        update() {
            if (this.prevx != this.x || this.prevy != this.y) {
                this.sprite.rotation = Math.atan2(this.y - this.prevy, this.x - this.prevx);
            }
            this.prevx = this.x;
            this.prevy = this.y;
        }

        // Set the hovered state on this ship
        //  This will toggle the hover effect
        setHovered(hovered: boolean) {
            Animation.setVisibility(this.game, this.hover, hovered, 200);
        }

        // Set the playing state on this ship
        //  This will toggle the "playing" indicator
        setPlaying(playing: boolean) {
            this.frame.loadTexture(`battle-arena-ship-${playing ? "playing" : "normal"}-${this.enemy ? "enemy" : "own"}`);
        }

        /**
         * Move the sprite to a location
         * 
         * Return the duration of animation
         */
        moveTo(x: number, y: number, facing_angle: number, animate = true): number {
            if (animate) {
                if (x == this.x && y == this.y) {
                    let tween = this.game.tweens.create(this.sprite);
                    let duration = Animation.rotationTween(tween, facing_angle, 0.3);
                    tween.start();
                    return duration;
                } else {
                    let distance = Target.newFromLocation(this.x, this.y).getDistanceTo(Target.newFromLocation(x, y));
                    var tween = this.game.tweens.create(this);
                    let duration = Math.sqrt(distance / 1000) * 3000;
                    let curve_force = distance * 0.4;
                    tween.to({
                        x: [this.x + Math.cos(this.sprite.rotation) * curve_force, x - Math.cos(facing_angle) * curve_force, x],
                        y: [this.y + Math.sin(this.sprite.rotation) * curve_force, y - Math.sin(facing_angle) * curve_force, y]
                    }, duration, Phaser.Easing.Sinusoidal.InOut);
                    tween.interpolation((v, k) => Phaser.Math.bezierInterpolation(v, k));
                    tween.start();
                    return duration;
                }
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
