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
        private hovered: ArenaShip | null;
        // Currently playing ship
        private playing: ArenaShip | null;

        // Layer for particles
        layer_weapon_effects: Phaser.Group;

        // Create a graphical arena for ship sprites to fight in a 2D space
        constructor(battleview: BattleView) {
            super(battleview.game);

            this.battleview = battleview;
            this.playing = null;
            this.hovered = null;
            this.range_hint = new RangeHint(this);

            var offset_x = 112;
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

            this.add(this.background);
            this.add(this.range_hint);

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
                this.add(sprite);
                this.ship_sprites.push(sprite);
            });

            this.layer_weapon_effects = new Phaser.Group(this.game);
            this.add(this.layer_weapon_effects);
        }

        // Get the current MainUI instance
        getGame(): MainUI {
            return this.battleview.gameui;
        }

        /**
         * Get the current battle displayed
         */
        getBattle(): Battle {
            return this.battleview.battle;
        }

        // Remove a ship sprite
        markAsDead(ship: Ship): void {
            var sprite = this.findShipSprite(ship);
            if (sprite) {
                sprite.setDead(true);
            }
        }

        // Find the sprite for a ship
        findShipSprite(ship: Ship): ArenaShip | null {
            var result: ArenaShip | null = null;
            this.ship_sprites.forEach((sprite: ArenaShip) => {
                if (sprite.ship === ship) {
                    result = sprite;
                }
            });
            return result;
        }

        // Set the hovered state on a ship sprite
        setShipHovered(ship: Ship | null): void {
            if (this.hovered) {
                this.hovered.setHovered(false);
            }

            if (ship) {
                var arena_ship = this.findShipSprite(ship);
                if (arena_ship) {
                    arena_ship.setHovered(true);
                }
                this.hovered = arena_ship;
            } else {
                this.hovered = null;
            }
        }

        // Set the playing state on a ship sprite
        setShipPlaying(ship: Ship | null): void {
            if (this.playing) {
                this.playing.setPlaying(false);
                this.playing = null;
            }

            if (ship) {
                var arena_ship = this.findShipSprite(ship);
                if (arena_ship) {
                    this.bringToTop(arena_ship);
                    arena_ship.setPlaying(true);
                }
                this.playing = arena_ship;
            }

            this.battleview.gameui.audio.playOnce("battle-ship-change");
        }

        /**
         * Find an ArenaDrone displaying a Drone.
         */
        findDrone(drone: Drone): ArenaDrone | null {
            return first(this.drone_sprites, sprite => sprite.drone == drone);
        }

        /**
         * Spawn a new drone
         * 
         * Return the duration of deploy animation
         */
        addDrone(drone: Drone, animate = true): number {
            if (!this.findDrone(drone)) {
                let sprite = new ArenaDrone(this.battleview, drone);
                let angle = Math.atan2(drone.y - drone.owner.arena_y, drone.x - drone.owner.arena_x);
                this.add(sprite);
                this.drone_sprites.push(sprite);

                if (animate) {
                    sprite.position.set(drone.owner.arena_x, drone.owner.arena_y);
                    sprite.rotation = drone.owner.arena_angle;
                    let move_duration = Animations.moveInSpace(sprite, drone.x, drone.y, angle);
                    this.game.tweens.create(sprite.radius).from({ alpha: 0 }, 500, Phaser.Easing.Cubic.In, true, move_duration);

                    return move_duration + 500;
                } else {
                    sprite.position.set(drone.x, drone.y);
                    sprite.rotation = angle;
                    return 0;
                }

            } else {
                console.error("Drone added twice to arena", drone);
                return 0;
            }
        }

        /**
         * Remove a destroyed drone
         */
        removeDrone(drone: Drone): void {
            let sprite = this.findDrone(drone);
            if (sprite) {
                remove(this.drone_sprites, sprite);
                sprite.setDestroyed();
            } else {
                console.error("Drone not found in arena for removal", drone);
            }
        }

        /**
         * Highlight ships that would be the target of current action
         */
        highlightTargets(ships: Ship[]): void {
            this.ship_sprites.forEach(sprite => sprite.setTargetted(contains(ships, sprite.ship)));
        }

        /**
         * Switch the tactical mode (shows information on all ships, and fades background)
         */
        setTacticalMode(active: boolean): void {
            this.ship_sprites.forEach(sprite => sprite.setHovered(active));
            if (this.battleview.background) {
                this.battleview.animations.setVisible(this.battleview.background, !active, 200);
            }
        }

        /**
         * Get the boundaries of the arena on display
         */
        getBoundaries(): IBounded {
            return { x: 130, y: 140, width: 1920 - 138, height: 1080 - 148 };
        }
    }
}
