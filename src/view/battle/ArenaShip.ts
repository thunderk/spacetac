module SpaceTac.View {
    // Ship sprite in the arena (BattleView)
    export class ArenaShip extends Phaser.Group {
        // Link to displayed ship
        ship: Game.Ship;

        // Boolean to indicate if it is an enemy ship
        enemy: boolean;

        // Ship sprite
        sprite: Phaser.Button;

        // Hover effect
        hover: Phaser.Image;

        // Frame to indicate the owner of the ship, and if it is playing
        frame: Phaser.Image;

        // Create a ship sprite usable in the Arena
        constructor(battleview: BattleView, ship: Game.Ship) {
            super(battleview.game);

            this.ship = ship;
            this.enemy = this.ship.getPlayer() != battleview.player;

            // Add ship sprite
            this.sprite = new Phaser.Button(battleview.game, 0, 0, "ship-" + ship.model + "-sprite");
            this.sprite.rotation = ship.arena_angle;
            this.sprite.anchor.set(0.5, 0.5);
            this.addChild(this.sprite);

            // Add playing effect
            this.frame = new Phaser.Image(battleview.game, 0, 0, `battle-arena-ship-normal-${this.enemy ? "enemy" : "own"}`, 0);
            this.frame.anchor.set(0.5, 0.5);
            this.addChild(this.frame);

            // Add hover effect
            this.hover = new Phaser.Image(battleview.game, 0, 0, "battle-arena-ship-hover", 0);
            this.hover.anchor.set(0.5, 0.5);
            this.hover.visible = false;
            this.addChild(this.hover);

            // Handle input on ship sprite
            this.sprite.input.useHandCursor = true;
            this.sprite.onInputOver.add(() => {
                battleview.cursorOnShip(ship);
            });
            this.sprite.onInputOut.add(() => {
                battleview.cursorOffShip(ship);
            });
            this.sprite.onInputUp.add(() => {
                battleview.cursorClicked();
            });

            // Set location
            this.position.set(ship.arena_x, ship.arena_y);
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

        // Move the sprite to a location
        moveTo(x: number, y: number, facing_angle: number, animate: boolean = true) {
            if (animate) {
                var tween_group = this.game.tweens.create(this);
                var tween_sprite = this.game.tweens.create(this.sprite);
                tween_group.to({ x: x, y: y });
                tween_group.start();
                Tools.rotationTween(tween_sprite, facing_angle);
                tween_sprite.start();
            } else {
                this.x = x;
                this.y = y;
                this.sprite.rotation = facing_angle;
            }
        }

        // Briefly display the damage done to the ship
        displayDamage(hull: number, shield: number) {
            if (hull > 0) {
                var hull_text = new Phaser.Text(this.game, -20, -20, Math.round(hull).toString(),
                    { font: "bold 16pt Arial", align: "center", fill: "#ffbbbb" });
                hull_text.anchor.set(0.5, 0.5);
                this.addChild(hull_text);
                this.animateDamageText(hull_text);
            }
            if (shield > 0) {
                var shield_text = new Phaser.Text(this.game, 20, -20, Math.round(shield).toString(),
                    { font: "bold 16pt Arial", align: "center", fill: "#bbbbff" });
                shield_text.anchor.set(0.5, 0.5);
                this.addChild(shield_text);
                this.animateDamageText(shield_text);
            }
        }

        private animateDamageText(text: Phaser.Text) {
            text.alpha = 0;
            var tween = this.game.tweens.create(text);
            tween.to({ alpha: 1 }, 100, Phaser.Easing.Circular.In, false, 400);
            tween.to({ y: -50, alpha: 0 }, 1000, Phaser.Easing.Circular.In, false, 1000);
            tween.onComplete.addOnce(() => {
                text.destroy();
            });
            tween.start();
        }
    }
}
