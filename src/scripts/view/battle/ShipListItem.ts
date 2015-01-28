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

        // Create a ship button for the battle ship list
        constructor(list: ShipList, x: number, y: number, ship: Game.Ship, owned: boolean) {
            this.ship = ship;

            super(list.battleview.game, x, y, owned ? "battle-shiplist-own" : "battle-shiplist-enemy");

            this.input.useHandCursor = true;
            this.onInputOver.add(() => {
                list.battleview.cursorOnShip(ship);
            });
            this.onInputOut.add(() => {
                list.battleview.cursorOffShip(ship);
            });

            this.hull = ValueBar.newStandard(list.battleview.game, 40, 0);
            this.hull.scale.set(0.1, 0.1);
            this.addChild(this.hull);

            this.shield = ValueBar.newStandard(list.battleview.game, 40, 20);
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
    }
}
