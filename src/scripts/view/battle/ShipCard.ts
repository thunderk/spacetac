module SpaceTac.View {
    "use strict";

    // Card to display detailed information about a ship
    export class ShipCard extends Phaser.Sprite {
        // Displayed ship
        ship: Game.Ship;

        // Hull gauge
        hull: ValueBar;

        // Shield gauge
        shield: ValueBar;

        // AP gauge
        ap: ValueBar;

        // Ship portrait
        portrait: Phaser.Image;

        // Build an empty ship card
        constructor(battleview: BattleView, x: number, y: number) {
            super(battleview.game, x, y, "battle-ship-card");

            this.ship = null;
            this.visible = false;

            this.portrait = null;

            this.hull = ValueBar.newStyled(this.game, "battle-shipcard-hull", 122, 8, true);
            this.addChild(this.hull);

            this.shield = ValueBar.newStyled(this.game, "battle-shipcard-shield", 156, 8, true);
            this.addChild(this.shield);

            this.ap = ValueBar.newStyled(this.game, "battle-shipcard-ap", 189, 8, true);
            this.addChild(this.ap);

            battleview.ui.add(this);
        }

        // Set the currently displayed ship (null to hide)
        setShip(ship: Game.Ship) {
            this.ship = ship;
            Animation.setVisibility(this.game, this, ship !== null, 200);

            if (this.ship) {
                this.updateAttributes();
            }

            if (this.portrait) {
                this.portrait.destroy();
            }
            this.portrait = new Phaser.Image(this.game, 47, 47, "ship-scout-portrait", 0);
            this.portrait.anchor.set(0.5, 0.5);
            this.addChild(this.portrait);
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
    }
}
