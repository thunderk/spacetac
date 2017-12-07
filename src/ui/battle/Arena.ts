module TK.SpaceTac.UI {
    /**
     * Graphical representation of a battle
     * 
     * This is the area in the BattleView that will display ships with their real positions
     */
    export class Arena {
        // Link to battleview
        view: BattleView

        // Boundaries of the arena
        boundaries: IBounded = { x: 0, y: 0, width: 1808, height: 948 }

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
        container: Phaser.Group
        layer_garbage: Phaser.Group
        layer_hints: Phaser.Group
        layer_drones: Phaser.Group
        layer_ships: Phaser.Group
        layer_weapon_effects: Phaser.Group
        layer_targetting: Phaser.Group

        // Callbacks to receive cursor events
        callbacks_hover: ((location: ArenaLocation | null, ship: Ship | null) => void)[] = []
        callbacks_click: (() => void)[] = []

        // Create a graphical arena for ship sprites to fight in a 2D space
        constructor(view: BattleView, container?: Phaser.Group) {
            this.view = view;
            this.playing = null;
            this.hovered = null;
            this.range_hint = new RangeHint(this);

            this.container = container || new Phaser.Group(view.game, undefined, "arena");
            this.container.position.set(this.boundaries.x, this.boundaries.y);

            this.setupMouseCapture();

            this.layer_garbage = this.container.add(new Phaser.Group(view.game, undefined, "garbage"));
            this.layer_hints = this.container.add(new Phaser.Group(view.game, undefined, "hints"));
            this.layer_drones = this.container.add(new Phaser.Group(view.game, undefined, "drones"));
            this.layer_ships = this.container.add(new Phaser.Group(view.game, undefined, "ships"));
            this.layer_weapon_effects = this.container.add(new Phaser.Group(view.game, undefined, "effects"));
            this.layer_targetting = this.container.add(new Phaser.Group(view.game, undefined, "targetting"));

            this.range_hint.setLayer(this.layer_hints);
            this.addShipSprites();

            this.container.onDestroy.add(() => this.destroy());

            view.log_processor.watchForShipChange(ship => {
                return {
                    foreground: async () => {
                        await this.setShipPlaying(ship)
                    }
                }
            });
        }

        /**
         * Move to a specific layer
         */
        moveToLayer(layer: Phaser.Group): void {
            layer.add(this.container);
        }

        /**
         * Setup the mouse capture for targetting events
         */
        setupMouseCapture() {
            let view = this.view;

            var background = new Phaser.Button(view.game, 0, 0, "battle-arena-background");
            background.name = "mouse-capture";
            background.scale.set(this.boundaries.width / background.width, this.boundaries.height / background.height);
            this.mouse_capture = background;

            // Capture clicks on background
            background.onInputUp.add(() => {
                this.callbacks_click.forEach(callback => callback());
            });
            background.onInputOut.add(() => {
                this.callbacks_hover.forEach(callback => callback(null, null));
            });

            // Watch mouse move to capture hovering over background
            this.input_callback = this.view.input.addMoveCallback((pointer: Phaser.Pointer) => {
                if (this.view.dialogs_opened.length > 0 || this.view.character_sheet.isOpened()) {
                    return;
                }

                let point = new Phaser.Point();
                if (view.input.hitTest(background, pointer, point)) {
                    let location = new ArenaLocation(point.x * background.scale.x, point.y * background.scale.y);
                    let ship = this.getShip(location);
                    this.callbacks_hover.forEach(callback => callback(location, ship));
                }
            }, null);

            this.container.add(this.mouse_capture);
        }

        /**
         * Get the ship under a cursor location
         */
        getShip(location: ArenaLocation): Ship | null {
            let nearest = minBy(this.ship_sprites, sprite => arenaDistance(location, sprite.ship.location));
            if (nearest && arenaDistance(location, nearest) < 50) {
                return nearest.ship;
            } else {
                return null;
            }
        }

        /**
         * Call when the arena is destroyed to properly remove input handlers
         */
        destroy() {
            if (this.input_callback) {
                this.view.input.deleteMoveCallback(this.input_callback);
                this.input_callback = null;
            }
        }

        /**
         * Add the sprites for all ships
         */
        addShipSprites() {
            iforeach(this.view.battle.iships(), ship => {
                let sprite = new ArenaShip(this, ship);
                this.layer_ships.add(sprite);
                this.ship_sprites.push(sprite);
            });
        }

        /**
         * Get the current MainUI instance
         */
        get game(): MainUI {
            return this.view.gameui;
        }

        /**
         * Get the current battle displayed
         */
        getBattle(): Battle {
            return this.view.battle;
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
        findShipSprite(ship: Ship | RObjectId | null): ArenaShip | null {
            return first(this.ship_sprites, sprite => sprite.ship.is(ship));
        }

        // Set the hovered state on a ship sprite
        setShipHovered(ship: Ship | null): void {
            if (this.hovered) {
                this.hovered.setHovered(false, false);
            }

            if (ship) {
                var arena_ship = this.findShipSprite(ship);
                if (arena_ship) {
                    arena_ship.setHovered(true, false);
                    this.layer_ships.bringToTop(arena_ship);
                }
                this.hovered = arena_ship;
            } else {
                this.hovered = null;
            }
        }

        /**
         * Set the playing state on a ship sprite
         */
        async setShipPlaying(ship: Ship | null, animate = true): Promise<void> {
            if (this.playing) {
                this.playing.setPlaying(false);
                this.playing = null;
            }

            if (ship) {
                let arena_ship = this.findShipSprite(ship);
                if (arena_ship) {
                    this.layer_ships.bringToTop(arena_ship);
                    await arena_ship.setPlaying(true, animate);
                }

                this.playing = arena_ship;
            }
        }

        /**
         * Find an ArenaDrone displaying a Drone.
         */
        findDrone(drone: Drone | RObjectId | null): ArenaDrone | null {
            return first(this.drone_sprites, sprite => sprite.drone.is(drone));
        }

        /**
         * Spawn a new drone
         * 
         * Return the duration of deploy animation
         */
        addDrone(drone: Drone, animate = true): number {
            if (!this.findDrone(drone)) {
                let sprite = new ArenaDrone(this.view, drone);
                let owner = this.view.battle.getShip(drone.owner) || new Ship();
                let angle = Math.atan2(drone.y - owner.arena_y, drone.x - owner.arena_x);
                this.layer_drones.add(sprite);
                this.drone_sprites.push(sprite);

                if (animate) {
                    sprite.position.set(owner.arena_x, owner.arena_y);
                    sprite.sprite.rotation = owner.arena_angle;
                    let move_duration = Animations.moveInSpace(sprite, drone.x, drone.y, angle, sprite.sprite);
                    this.view.tweens.create(sprite.radius).from({ alpha: 0 }, 500, Phaser.Easing.Cubic.In, true, move_duration);

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
         * 
         * Return the duration of deploy animation
         */
        removeDrone(drone: Drone): number {
            let sprite = this.findDrone(drone);
            if (sprite) {
                remove(this.drone_sprites, sprite);
                return sprite.setDestroyed();
            } else {
                console.error("Drone not found in arena for removal", drone);
                return 0;
            }
        }

        /**
         * Switch the tactical mode (shows information on all ships, and fades background)
         */
        setTacticalMode(active: boolean): void {
            this.ship_sprites.forEach(sprite => sprite.setHovered(active, true));
            this.drone_sprites.forEach(drone => drone.setTacticalMode(active));
            this.view.animations.setVisible(this.layer_garbage, !active, 200);
            if (this.view.background) {
                this.view.animations.setVisible(this.view.background, !active, 200);
            }
        }

        /**
         * Get the boundaries of the arena on display
         */
        getBoundaries(): IBounded {
            return this.boundaries;
        }
    }
}
