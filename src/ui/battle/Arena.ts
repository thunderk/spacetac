module TS.SpaceTac.UI {
    /**
     * Graphical representation of a battle
     * 
     * This is the area in the BattleView that will display ships with their real positions
     */
    export class Arena extends Phaser.Group {
        // Link to battleview
        battleview: BattleView

        // Boundaries of the arena
        boundaries: IBounded = { x: 112, y: 132, width: 1808, height: 948 }

        // Hint for weapon or move range
        range_hint: RangeHint

        // Input capture
        private mouse_capture: Phaser.Button

        // Input callback to receive mouse move events
        private input_callback: any = null

        // List of ship sprites
        private ship_sprites: ArenaShip[] = []

        // List of drone sprites
        private drone_sprites: ArenaDrone[] = []

        // Currently hovered ship
        private hovered: ArenaShip | null
        // Currently playing ship
        private playing: ArenaShip | null

        // Layer for particles
        layer_garbage: Phaser.Group
        layer_hints: Phaser.Group
        layer_drones: Phaser.Group
        layer_ships: Phaser.Group
        layer_weapon_effects: Phaser.Group
        layer_targetting: Phaser.Group

        // Create a graphical arena for ship sprites to fight in a 2D space
        constructor(battleview: BattleView) {
            super(battleview.game);

            this.battleview = battleview;
            this.playing = null;
            this.hovered = null;
            this.range_hint = new RangeHint(this);

            this.position.set(this.boundaries.x, this.boundaries.y);

            this.init();
        }

        /**
         * Setup the mouse capture for targetting events
         */
        setupMouseCapture() {
            let battleview = this.battleview;

            var background = new Phaser.Button(battleview.game, 0, 0, "battle-arena-background");
            background.scale.set(this.boundaries.width / background.width, this.boundaries.height / background.height);
            this.mouse_capture = background;

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

            this.add(this.mouse_capture);
        }

        destroy() {
            if (this.input_callback) {
                this.game.input.deleteMoveCallback(this.input_callback);
                this.input_callback = null;
            }
            super.destroy();
        }

        /**
         * Initialize state (create sprites)
         */
        init(): void {
            this.setupMouseCapture();

            this.layer_garbage = this.add(new Phaser.Group(this.game));
            this.layer_hints = this.add(new Phaser.Group(this.game));
            this.layer_drones = this.add(new Phaser.Group(this.game));
            this.layer_ships = this.add(new Phaser.Group(this.game));
            this.layer_weapon_effects = this.add(new Phaser.Group(this.game));
            this.layer_targetting = this.add(new Phaser.Group(this.game));

            this.layer_hints.add(this.range_hint);
            this.addShipSprites();
        }

        /**
         * Add the sprites for all ships
         */
        addShipSprites() {
            iforeach(this.battleview.battle.iships(), ship => {
                let sprite = new ArenaShip(this, ship);
                this.layer_ships.add(sprite);
                this.ship_sprites.push(sprite);
            });
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
                this.layer_garbage.add(sprite);
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
                    this.layer_ships.bringToTop(arena_ship);
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
                    this.layer_ships.bringToTop(arena_ship);
                    arena_ship.setPlaying(true);
                }
                this.playing = arena_ship;
            }
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
                this.layer_drones.add(sprite);
                this.drone_sprites.push(sprite);

                if (animate) {
                    sprite.position.set(drone.owner.arena_x, drone.owner.arena_y);
                    sprite.sprite.rotation = drone.owner.arena_angle;
                    let move_duration = Animations.moveInSpace(sprite, drone.x, drone.y, angle, sprite.sprite);
                    this.game.tweens.create(sprite.radius).from({ alpha: 0 }, 500, Phaser.Easing.Cubic.In, true, move_duration);

                    return move_duration + 500;
                } else {
                    sprite.position.set(drone.x, drone.y);
                    sprite.sprite.rotation = angle;
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
                this.layer_garbage.add(sprite);
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
            this.drone_sprites.forEach(drone => drone.setTacticalMode(active));
            this.battleview.animations.setVisible(this.layer_garbage, !active, 200);
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
