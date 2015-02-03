module SpaceTac.View {
    "use strict";

    // One item in a ship list (used in BattleView)
    export class ShipListItem extends Phaser.Button {
        // Reference to the ship game object
        ship: Game.Ship;

        // Hull display
        hull: ValueBar;

        // Shield display
        shield: ValueBar;

        // Playing indicator
        layer_playing: Phaser.Image;

        // Non-playing indicator
        layer_normal: Phaser.Image;

        // Enemy indicator
        layer_enemy: Phaser.Image;

        // Create a ship button for the battle ship list
        constructor(list: ShipList, x: number, y: number, ship: Game.Ship, owned: boolean) {
            this.ship = ship;

            super(list.battleview.game, x, y, "battle-shiplist-base");

            this.input.useHandCursor = true;
            this.onInputOver.add(() => {
                list.battleview.cursorOnShip(ship);
            });
            this.onInputOut.add(() => {
                list.battleview.cursorOffShip(ship);
            });

            this.layer_playing = new Phaser.Image(this.game, 0, 0, "battle-shiplist-playing", 0);
            this.layer_playing.alpha = 0;
            this.addChild(this.layer_playing);

            this.layer_normal = new Phaser.Image(this.game, 0, 0, "battle-shiplist-normal", 0);
            this.addChild(this.layer_normal);

            this.layer_enemy = new Phaser.Image(this.game, 0, 0, owned ? "battle-shiplist-own" : "battle-shiplist-enemy", 0);
            this.addChild(this.layer_enemy);

            this.hull = ValueBar.newStandard(list.battleview.game, 85, 28);
            this.hull.scale.set(0.1, 0.1);
            this.addChild(this.hull);

            this.shield = ValueBar.newStandard(list.battleview.game, 85, 46);
            this.shield.scale.set(0.1, 0.1);
            this.addChild(this.shield);
        }

        // Called when an attribute for this ship changed through the battle log
        attributeChanged(attribute: Game.Attribute): void {
            if (attribute.code === Game.AttributeCode.Hull) {
                this.hull.setValue(attribute.current, attribute.maximal);
            } else if (attribute.code === Game.AttributeCode.Shield) {
                this.shield.setValue(attribute.current, attribute.maximal);
            }
        }

        // Set the playing status
        setPlaying(playing: boolean) {
            var tween1 = this.game.tweens.create(this.layer_playing);
            tween1.to({alpha: playing ? 1 : 0});
            tween1.start();
            var tween2 = this.game.tweens.create(this.layer_normal);
            tween2.to({alpha: playing ? 0 : 1});
            tween2.start();
        }
    }
}
