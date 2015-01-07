module SpaceTac.View {
    "use strict";

    // Graphical representation of a battle
    //  This is the area in the BattleView that will display ships with their real positions
    export class Arena extends Phaser.Group {
        // Arena background
        background: Phaser.Button;

        // Input callback to receive mouse move events
        private input_callback: any;

        // Link to battleview
        private battleview: BattleView;

        // List of ship sprites
        private ship_sprites: ShipArenaSprite[];

        constructor(battleview: BattleView) {
            this.battleview = battleview;
            this.ship_sprites = [];

            super(battleview.game);

            var background = new Phaser.Button(battleview.game, 0, 0, "ui-arena-background");
            background.scale.set(20, 10);
            this.background = background;

            // Capture clicks on background
            background.onInputUp.add(() => {
                battleview.cursorClicked();
            });

            // Watch mouse move to capture hovering over background
            this.input_callback = this.game.input.addMoveCallback((pointer: Phaser.Pointer) => {
                var point = new Phaser.Point();
                if (battleview.game.input.hitTest(background, pointer, point)) {
                    battleview.cursorInSpace(point.x * background.scale.x, point.y * background.scale.y);
                }
            }, null);

            this.add(this.background);

            this.init();
        }

        destroy() {
            this.game.input.deleteMoveCallback(this.input_callback);
        }

        // Initialize state (create sprites)
        init(): void {
            var arena = this;

            // Add ship sprites
            this.battleview.battle.play_order.forEach(function (ship: Game.Ship) {
                var sprite = new ShipArenaSprite(arena.battleview, ship);
                arena.add(sprite);
                arena.ship_sprites.push(sprite);
            });
        }

        // Find the sprite for a ship
        findShipSprite(ship: Game.Ship): ShipArenaSprite {
            var result: ShipArenaSprite = null;
            this.ship_sprites.forEach((sprite: ShipArenaSprite) => {
                if (sprite.ship === ship) {
                    result = sprite;
                }
            });
            return result;
        }
    }
}
