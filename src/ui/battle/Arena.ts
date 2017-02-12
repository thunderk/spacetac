module TS.SpaceTac.UI {
    // Graphical representation of a battle
    //  This is the area in the BattleView that will display ships with their real positions
    export class Arena extends Phaser.Group {
        // Link to battleview
        battleview: BattleView;

        // Arena background
        background: Phaser.Button;

        // Hint for weapon or move range
        range_hint: RangeHint;

        // Input callback to receive mouse move events
        private input_callback: any;

        // List of ship sprites
        private ship_sprites: ArenaShip[] = [];

        // List of drone sprites
        private drone_sprites: ArenaDrone[] = [];

        // Currently hovered ship
        private hovered: ArenaShip;
        // Currently playing ship
        private playing: ArenaShip;

        // Create a graphical arena for ship sprites to fight in a 2D space
        constructor(battleview: BattleView) {
            super(battleview.game);

            this.battleview = battleview;
            this.playing = null;
            this.hovered = null;
            this.range_hint = null;

            var offset_x = 133;
            var offset_y = 132;

            var background = new Phaser.Button(battleview.game, 0, 0, "battle-arena-background");
            var expected_width = battleview.getWidth() - offset_x;
            var expected_height = battleview.getHeight() - offset_y;
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

            this.position.set(offset_x, offset_y);
            this.addChild(this.background);

            this.range_hint = new RangeHint(this);
            this.addChild(this.range_hint);

            this.scale.set(1.78, 1.78);

            this.init();
        }

        destroy() {
            this.game.input.deleteMoveCallback(this.input_callback);
            super.destroy();
        }

        // Initialize state (create sprites)
        init(): void {
            // Add ship sprites
            this.battleview.battle.play_order.forEach(ship => {
                var sprite = new ArenaShip(this, ship);
                this.addChild(sprite);
                this.ship_sprites.push(sprite);
            });
        }

        // Get the current MainUI instance
        getGame(): MainUI {
            return this.battleview.gameui;
        }

        // Remove a ship sprite
        markAsDead(ship: Ship): void {
            var sprite = this.findShipSprite(ship);
            if (sprite) {
                sprite.alpha = 0.5;
                sprite.displayEffect("Emergency Stasis", false);
            }
        }

        // Find the sprite for a ship
        findShipSprite(ship: Ship): ArenaShip {
            var result: ArenaShip = null;
            this.ship_sprites.forEach((sprite: ArenaShip) => {
                if (sprite.ship === ship) {
                    result = sprite;
                }
            });
            return result;
        }

        // Set the hovered state on a ship sprite
        setShipHovered(ship: Ship): void {
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
        setShipPlaying(ship: Ship): void {
            if (this.playing) {
                this.playing.setPlaying(false);
            }
            var arena_ship = this.findShipSprite(ship);
            if (arena_ship) {
                arena_ship.setPlaying(true);
            }
            this.playing = arena_ship;

            this.battleview.gameui.audio.playOnce("battle-ship-change");
        }

        // Spawn a new drone
        addDrone(drone: Drone): void {
            if (!any(this.drone_sprites, sprite => sprite.drone == drone)) {
                let sprite = new ArenaDrone(this.battleview, drone);
                this.addChild(sprite);
                this.drone_sprites.push(sprite);

                sprite.position.set(drone.owner.arena_x, drone.owner.arena_y);
                this.game.tweens.create(sprite.position).to({ x: drone.x, y: drone.y }, 1800, Phaser.Easing.Sinusoidal.InOut, true, 200);
            } else {
                console.error("Drone added twice to arena", drone);
            }
        }

        // Remove a destroyed drone
        removeDrone(drone: Drone): void {
            let sprite = first(this.drone_sprites, sprite => sprite.drone == drone);
            if (sprite) {
                remove(this.drone_sprites, sprite);
                sprite.destroy();
            } else {
                console.error("Drone not found in arena for removal", drone);
            }
        }
    }
}
