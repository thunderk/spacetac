module SpaceTac.View {
    "use strict";

    // Graphical representation of a battle
    //  This is the area in the BattleView that will display ships with their real positions
    export class Arena extends Phaser.Group {
        // Arena background
        background: Phaser.Button;

        // Hint for weapon or move range
        range_hint: RangeHint;

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
            this.range_hint = null;

            super(battleview.game);

            var background = new Phaser.Button(battleview.game, 0, 0, "battle-arena-background");
            var expected_width = battleview.getWidth() - 416;
            var expected_height = battleview.getHeight() - 100;
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

            this.position.set(196, 100);
            this.addChild(this.background);

            this.range_hint = new RangeHint(this);
            this.addChild(this.range_hint);

            this.init();
        }

        destroy() {
            this.game.input.deleteMoveCallback(this.input_callback);
            super.destroy();
        }

        // Initialize state (create sprites)
        init(): void {
            // Add ship sprites
            this.battleview.battle.play_order.forEach((ship: Game.Ship) => {
                var sprite = new ArenaShip(this.battleview, ship);
                this.addChild(sprite);
                this.ship_sprites.push(sprite);
            });
        }

        // Remove a ship sprite
        removeShip(ship: Game.Ship): void {
            var sprite = this.findShipSprite(ship);
            if (sprite) {
                this.ship_sprites.splice(this.ship_sprites.indexOf(sprite), 1);
                sprite.destroy();
            }
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

            Sound.playOnce(this.game, "battle-ship-change");
        }
    }
}
