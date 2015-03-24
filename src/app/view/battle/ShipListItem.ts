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

        // Action points display
        ap: ValueBar;

        // Portrait
        layer_portrait: Phaser.Image;

        // Hover indicator
        layer_hover: Phaser.Image;

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

            this.layer_portrait = new Phaser.Image(this.game, 14, 15, "ship-scout-portrait", 0);
            this.addChild(this.layer_portrait);

            this.layer_normal = new Phaser.Image(this.game, 0, 0, "battle-shiplist-normal", 0);
            this.addChild(this.layer_normal);

            this.layer_enemy = new Phaser.Image(this.game, 0, 0, owned ? "battle-shiplist-own" : "battle-shiplist-enemy", 0);
            this.addChild(this.layer_enemy);

            this.layer_hover = new Phaser.Image(this.game, 14, 14, "battle-arena-shipspritehover", 0);
            this.layer_hover.visible = false;
            this.addChild(this.layer_hover);

            this.hull = ValueBar.newStyled(list.battleview.game, "battle-shiplist-hull", 76, 23);
            this.addChild(this.hull);

            this.shield = ValueBar.newStyled(list.battleview.game, "battle-shiplist-shield", 76, 35);
            this.addChild(this.shield);

            this.ap = ValueBar.newStyled(list.battleview.game, "battle-shiplist-ap", 76, 47);
            this.addChild(this.ap);

            this.updateAttributes();
        }

        // Update attributes from associated ship
        updateAttributes() {
            this.attributeChanged(this.ship.hull);
            this.attributeChanged(this.ship.shield);
            this.attributeChanged(this.ship.ap_current);
        }

        // Called when an attribute for this ship changed through the battle log
        attributeChanged(attribute: Game.Attribute): void {
            if (attribute.code === Game.AttributeCode.Hull) {
                this.hull.setValue(attribute.current, attribute.maximal);
            } else if (attribute.code === Game.AttributeCode.Shield) {
                this.shield.setValue(attribute.current, attribute.maximal);
            } else if (attribute.code === Game.AttributeCode.AP) {
                this.ap.setValue(attribute.current, attribute.maximal);
            }
        }

        // Set the playing status
        setPlaying(playing: boolean) {
            Animation.setVisibility(this.game, this.layer_playing, playing, 500);
            Animation.setVisibility(this.game, this.layer_normal, !playing, 500);
        }

        // Set the hovered status
        setHovered(hovered: boolean) {
            Animation.setVisibility(this.game, this.layer_hover, hovered, 200);
        }
    }
}
