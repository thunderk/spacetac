module SpaceTac.View {
    "use strict";

    // Card to display detailed information about a ship
    export class ShipCard extends Phaser.Sprite {
        // Displayed ship
        ship: Game.Ship;

        // Build an empty ship card
        constructor(battleview: BattleView, x: number, y: number) {
            super(battleview.game, x, y, "battle-ship-card");

            this.ship = null;
            this.visible = false;

            battleview.ui.add(this);
        }

        // Set the currently displayed ship (null to hide)
        setShip(ship: Game.Ship) {
            this.ship = ship;
            Animation.setVisibility(this.game, this, ship !== null, 200);
        }
    }
}
