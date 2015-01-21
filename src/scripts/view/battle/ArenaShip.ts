module SpaceTac.View {
    "use strict";

    // Ship sprite in the arena (BattleView)
    export class ArenaShip extends Phaser.Group {
        // Link to displayed ship
        ship: Game.Ship;

        // Ship sprite
        sprite: Phaser.Button;

        // Hover effect
        hover: Phaser.Image;

        // Create a ship sprite usable in the Arena
        constructor(battleview: BattleView, ship: Game.Ship) {
            this.ship = ship;

            super(battleview.game);

            // Add hover effect
            this.hover = new Phaser.Image(battleview.game, 0, 0, "ui-battle-shipspritehover");
            this.hover.scale.set(0.4, 0.4);
            this.hover.anchor.set(0.5, 0.5);
            this.hover.visible = false;
            this.addChild(this.hover);

            // Add ship sprite
            this.sprite = new Phaser.Button(battleview.game, 0, 0, "arena-ship");
            this.sprite.scale.set(0.1, 0.1);
            this.sprite.rotation = ship.arena_angle;
            this.sprite.anchor.set(0.5, 0.5);
            this.addChild(this.sprite);

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
            this.hover.visible = hovered;
        }

        // Move the sprite to a location
        moveTo(x: number, y: number, animate: boolean = true) {
            var angle = Math.atan2(y - this.y, x - this.x);
            if (animate) {
                var tween_group = this.game.tweens.create(this);
                var tween_sprite = this.game.tweens.create(this.sprite);
                tween_group.to({x: x, y: y});
                tween_group.start();
                tween_sprite.to({rotation: angle});
                tween_sprite.start();
            } else {
                this.x = x;
                this.y = y;
                this.sprite.rotation = angle;
            }
        }
    }
}
