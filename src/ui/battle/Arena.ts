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
        private mouse_capture?: UIImage

        // List of ship sprites
        private ship_sprites: ArenaShip[] = []

        // List of drone sprites
        private drone_sprites: ArenaDrone[] = []

        // Currently hovered ship
        private hovered: ArenaShip | null
        // Currently playing ship
        private playing: ArenaShip | null

        // Layer for particles
        container: UIContainer
        layer_garbage: UIContainer
        layer_hints: UIContainer
        layer_drones: UIContainer
        layer_ships: UIContainer
        layer_weapon_effects: UIContainer
        layer_targetting: UIContainer

        // Callbacks to receive cursor events
        callbacks_hover: ((location: ArenaLocation | null, ship: Ship | null) => void)[] = []
        callbacks_click: (() => void)[] = []

        // Create a graphical arena for ship sprites to fight in a 2D space
        constructor(view: BattleView, container?: UIContainer) {
            this.view = view;
            this.playing = null;
            this.hovered = null;
            this.range_hint = new RangeHint(this);

            let builder = new UIBuilder(view, container);
            if (!container) {
                container = builder.container("arena");
                builder = builder.in(container);
            }
            this.container = container;
            container.setPosition(this.boundaries.x, this.boundaries.y);

            this.setupMouseCapture();

            this.layer_garbage = builder.container("garbage");
            this.layer_hints = builder.container("hints");
            this.layer_drones = builder.container("drones");
            this.layer_ships = builder.container("ships");
            this.layer_weapon_effects = builder.container("effects");
            this.layer_targetting = builder.container("targetting");

            this.range_hint.setLayer(this.layer_hints);
            this.addShipSprites();
            view.battle.drones.list().forEach(drone => this.addDrone(drone, false));

            view.log_processor.register(diff => this.checkDroneDeployed(diff));
            view.log_processor.register(diff => this.checkDroneRecalled(diff));
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
        moveToLayer(layer: UIContainer): void {
            layer.add(this.container);
        }

        /**
         * Setup the mouse capture for targetting events
         */
        setupMouseCapture() {
            let view = this.view;

            let background = new UIBuilder(view, this.container).image("battle-arena-background");
            background.setName("mouse-capture");
            background.setScale(this.boundaries.width / background.width, this.boundaries.height / background.height)

            // Capture clicks on background
            background.setInteractive();
            background.on("pointerup", () => {
                this.callbacks_click.forEach(callback => callback());
            });
            background.on("pointerout", () => {
                this.callbacks_hover.forEach(callback => callback(null, null));
            });

            // Watch mouse move to capture hovering over background
            view.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
                if (this.view.dialogs_opened.length > 0 || this.view.character_sheet.isOpened() || this.view.layer_overlay.length > 0) {
                    return;
                }

                let location = new ArenaLocation(pointer.x, pointer.y);
                let ship = this.getShip(location);
                this.callbacks_hover.forEach(callback => callback(location, ship));
            }, null);

            this.mouse_capture = background;
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
         * Add the sprites for all ships
         */
        addShipSprites() {
            iforeach(this.view.battle.iships(), ship => {
                let sprite = new ArenaShip(this, ship);
                (ship.alive ? this.layer_ships : this.layer_garbage).add(sprite);
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
                    sprite.radius.setAlpha(0);
                    sprite.setPosition(owner.arena_x, owner.arena_y);
                    sprite.sprite.setRotation(owner.arena_angle);
                    let move_duration = this.view.animations.moveInSpace(sprite, drone.x, drone.y, angle, sprite.sprite);
                    this.view.animations.addAnimation(sprite.radius, { alpha: 1 }, 500, "Cubic.easeIn", move_duration);

                    return move_duration + 500;
                } else {
                    sprite.setPosition(drone.x, drone.y);
                    sprite.setRotation(angle);
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

        /**
         * Check if a new drone as been deployed
         */
        private checkDroneDeployed(diff: BaseBattleDiff): LogProcessorDelegate {
            if (diff instanceof DroneDeployedDiff) {
                return {
                    foreground: async (animate) => {
                        let duration = this.addDrone(diff.drone, animate);
                        if (duration) {
                            this.view.gameui.audio.playOnce("battle-drone-deploy");
                            if (animate) {
                                await this.view.timer.sleep(duration);
                            }
                        }
                    }
                }
            } else {
                return {};
            }
        }

        /**
         * Check if a drone as been recalled
         */
        private checkDroneRecalled(diff: BaseBattleDiff): LogProcessorDelegate {
            if (diff instanceof DroneRecalledDiff) {
                return {
                    foreground: async () => {
                        let duration = this.removeDrone(diff.drone);
                        if (duration) {
                            this.view.gameui.audio.playOnce("battle-drone-destroy");
                            await this.view.timer.sleep(duration);
                        }
                    }
                }
            } else {
                return {};
            }
        }
    }
}
