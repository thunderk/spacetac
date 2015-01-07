module SpaceTac.View {
    "use strict";

    // One item in a ship list (used in BattleView)
    export class ShipListItem extends Phaser.Button {
        // Reference to the ship game object
        private ship: Game.Ship;

        // Create a ship button for the battle ship list
        constructor(battleview: BattleView, x: number, y: number, ship: Game.Ship, owned: boolean) {
            this.ship = ship;

            super(battleview.game, x, y, owned ? "ui-shiplist-own" : "ui-shiplist-enemy");
            battleview.ui.add(this);

            this.input.useHandCursor = true;
            this.onInputOver.add(() => {
                battleview.cursorOnShip(ship);
            });
            this.onInputOut.add(() => {
                battleview.cursorOffShip(ship);
            });
        }
    }
}
