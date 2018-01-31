module TK.SpaceTac.UI {
    // One item in a ship list (used in BattleView)
    export class ShipListItem extends Phaser.Button {
        // Reference to the view
        view: BaseView

        // Reference to the ship game object
        ship: Ship

        // Player indicator
        player_indicator: Phaser.Image

        // Portrait
        portrait: Phaser.Image

        // Damage flashing indicator
        damage_indicator: Phaser.Image

        // Hover indicator
        hover_indicator: Phaser.Image

        // Create a ship button for the battle ship list
        constructor(list: ShipList, x: number, y: number, ship: Ship, owned: boolean, ship_buttons: IShipButton) {
            super(list.view.game, x, y, "battle-shiplist-item-background");
            this.view = list.view;

            this.ship = ship;

            this.player_indicator = this.view.newImage(owned ? "battle-hud-ship-own-mini" : "battle-hud-ship-enemy-mini", 10, 52);
            this.player_indicator.anchor.set(0.5, 0.5);
            this.player_indicator.angle = 90;
            this.addChild(this.player_indicator);

            this.portrait = this.view.newImage(`ship-${ship.model.code}-sprite`, 62, 52);
            this.portrait.anchor.set(0.5, 0.5);
            this.portrait.scale.set(0.8, 0.8);
            this.portrait.angle = 180;
            this.addChild(this.portrait);

            this.damage_indicator = new Phaser.Image(this.game, 18, 9, "battle-shiplist-damage", 0);
            this.damage_indicator.alpha = 0;
            this.addChild(this.damage_indicator);

            this.hover_indicator = new Phaser.Image(this.game, 17, 8, "battle-shiplist-hover", 0);
            this.hover_indicator.visible = false;
            this.addChild(this.hover_indicator);

            this.view.inputs.setHoverClick(this,
                () => ship_buttons.cursorOnShip(ship),
                () => ship_buttons.cursorOffShip(ship),
                () => ship_buttons.cursorClicked()
            );
        }

        // Flash a damage indicator
        setDamageHit() {
            this.game.tweens.create(this.damage_indicator).to({ alpha: 1 }, 100).to({ alpha: 0 }, 150).repeatAll(2).start();
        }

        // Move to a given location on screen
        moveTo(x: number, y: number, duration: number) {
            if (duration && (this.x != x || this.y != y)) {
                this.view.animations.addAnimation(this, { x: x, y: y }, duration);
            } else {
                this.x = x;
                this.y = y;
            }
        }

        // Set the hovered status
        setHovered(hovered: boolean) {
            this.view.animations.setVisible(this.hover_indicator, hovered, 200);
        }
    }
}
