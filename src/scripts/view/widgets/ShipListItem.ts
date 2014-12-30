module SpaceTac.View.Widgets {
    // One item in a ship list (used in BattleView)
    export class ShipListItem extends Phaser.Button {
        // Create a ship button for the battle ship list
        constructor(ui: UIGroup, x: number, y: number, owned: boolean) {
            super(ui.game, x, y, owned ? 'ui-shiplist-own' : 'ui-shiplist-enemy');
            ui.add(this);
        }
    }
}