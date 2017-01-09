module SpaceTac.View {
    // Tooltip to display ship information
    export class ShipTooltip extends Phaser.Sprite {
        battleview: BattleView;
        title: Phaser.Text;

        constructor(parent: BattleView) {
            super(parent.game, 0, 0, "battle-ship-tooltip");
            this.visible = false;
            this.battleview = parent;

            this.title = new Phaser.Text(this.game, 247, 10, "", { font: "24px Arial", fill: "#ffffff" });
            this.title.anchor.set(0.5, 0);
            this.addChild(this.title);

            parent.ui.add(this);
        }

        // Set current ship to display, null to hide
        setShip(ship: Game.Ship | null): void {
            console.log(ship);
            if (ship) {
                // Find ship sprite to position next to it
                var sprite = this.battleview.arena.findShipSprite(ship);
                if (sprite) {
                    var x = sprite.worldPosition.x + sprite.width * 0.5;
                    var y = sprite.worldPosition.y - sprite.height * 0.5;
                    if (y + this.height > this.battleview.getHeight()) {
                        y = this.battleview.getHeight() - this.height;
                    }
                    if (y < 0) {
                        y = 0;
                    }
                    if (x + this.width > this.battleview.getWidth()) {
                        x = sprite.worldPosition.x - sprite.width * 0.5 - this.width;
                    }
                    this.position.set(x, y);
                } else {
                    this.position.set(0, 0);
                }

                // Fill info
                this.title.setText(ship.name);

                Animation.fadeIn(this.game, this, 200, 0.9);
            } else {
                Animation.fadeOut(this.game, this, 200);
            }
        }
    }
}
