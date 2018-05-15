module TK.SpaceTac.UI {
    /**
     * One item in a ship list (used in BattleView)
     */
    export class ShipListItem extends UIContainer {
        // Reference to the view
        view: BaseView

        // Reference to the ship game object
        ship: Ship

        // Player indicator
        player_indicator: UIImage

        // Portrait
        portrait: UIImage

        // Damage flashing indicator
        damage_indicator: UIImage

        // Hover indicator
        hover_indicator: UIImage

        // Create a ship button for the battle ship list
        constructor(list: ShipList, x: number, y: number, ship: Ship, owned: boolean, ship_buttons: IShipButton) {
            // TODO Make it an UIButton
            super(list.view, x, y);
            this.view = list.view;
            this.ship = ship;

            let builder = new UIBuilder(list.view, this);

            builder.image("battle-shiplist-item-background");

            this.player_indicator = builder.image(owned ? "battle-hud-ship-own-mini" : "battle-hud-ship-enemy-mini", 102, 52, true);
            this.player_indicator.setAngle(-90);

            this.portrait = builder.image(`ship-${ship.model.code}-sprite`, 52, 52, true);
            this.portrait.setScale(0.8)
            this.portrait.setAngle(180);

            this.damage_indicator = builder.image("battle-shiplist-damage", 8, 9);
            this.damage_indicator.visible = false;

            this.hover_indicator = builder.image("battle-shiplist-hover", 7, 8);
            this.hover_indicator.visible = false;

            this.view.inputs.setHoverClick(this,
                () => ship_buttons.cursorOnShip(ship),
                () => ship_buttons.cursorOffShip(ship),
                () => ship_buttons.cursorClicked()
            );
        }

        get location(): { x: number, y: number } {
            return { x: this.x, y: this.y };
        }

        /**
         * Flash a damage indicator
         */
        setDamageHit() {
            this.view.tweens.add({
                targets: this.damage_indicator,
                duration: 100,
                alpha: 1,
                repeat: 2,
                yoyo: true
            });
        }

        /**
         * Move to a given location on screen
         */
        moveAt(x: number, y: number, duration: number) {
            if (duration && (this.x != x || this.y != y)) {
                this.view.animations.addAnimation<UIContainer>(this, { x: x, y: y }, duration);
            } else {
                this.x = x;
                this.y = y;
            }
        }

        /**
         * Set the hovered status
         */
        setHovered(hovered: boolean) {
            this.view.animations.setVisible(this.hover_indicator, hovered, 200);
        }
    }
}
