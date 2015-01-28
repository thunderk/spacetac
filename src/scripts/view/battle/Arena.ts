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
        private ship_sprites: ArenaShip[];

        // Currently hovered ship
        private hovered: ArenaShip;
        // Currently playing ship
        private playing: ArenaShip;

        // Create a graphical arena for ship sprites to fight in a 2D space
        constructor(battleview: BattleView) {
            this.battleview = battleview;
            this.ship_sprites = [];
            this.playing = null;
            this.hovered = null;

            super(battleview.game);
            this.scale.set(2, 2);

            var background = new Phaser.Button(battleview.game, 0, 0, "battle-arena-background");
            var expected_width = 1280 - 252;
            var expected_height = 720 - 100;
            background.scale.set(expected_width / background.width, expected_height / background.height);
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

            this.position.set(32, 100);
            this.addChild(this.background);

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
                var sprite = new ArenaShip(arena.battleview, ship);
                arena.addChild(sprite);
                arena.ship_sprites.push(sprite);
            });
        }

        // Find the sprite for a ship
        findShipSprite(ship: Game.Ship): ArenaShip {
            var result: ArenaShip = null;
            this.ship_sprites.forEach((sprite: ArenaShip) => {
                if (sprite.ship === ship) {
                    result = sprite;
                }
            });
            return result;
        }

        // Set the hovered state on a ship sprite
        setShipHovered(ship: Game.Ship): void {
            if (this.hovered) {
                this.hovered.setHovered(false);
            }
            var arena_ship = this.findShipSprite(ship);
            if (arena_ship) {
                arena_ship.setHovered(true);
            }
            this.hovered = arena_ship;
        }

        // Set the playing state on a ship sprite
        setShipPlaying(ship: Game.Ship): void {
            if (this.playing) {
                this.playing.setPlaying(false);
            }
            var arena_ship = this.findShipSprite(ship);
            if (arena_ship) {
                arena_ship.setPlaying(true);
            }
            this.playing = arena_ship;
        }
    }
}
