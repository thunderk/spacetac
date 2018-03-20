/// <reference path="../BaseView.ts"/>

module TK.SpaceTac.UI {
    /**
     * Interactive map of the universe
     */
    export class UniverseMapView extends BaseView {
        // Displayed universe
        universe = new Universe()

        // Interacting player
        player = new Player()

        // Interaction enabled or not
        interactive = true

        // Layers
        layer_universe!: Phaser.Group
        layer_overlay!: Phaser.Group

        // Star systems
        starsystems: StarSystemDisplay[] = []

        // Links between stars
        starlinks_group!: Phaser.Group
        starlinks: Phaser.Graphics[] = []

        // Fleets
        player_fleet!: FleetDisplay

        // Markers
        current_location!: CurrentLocationMarker
        mission_markers!: MissionLocationMarker

        // Actions for selected location
        actions!: MapLocationMenu

        // Active missions
        missions!: ActiveMissionsDisplay
        conversation!: MissionConversationDisplay

        // Character sheet
        character_sheet!: CharacterSheet

        // Zoom level
        zoom = 0
        zoom_in!: Phaser.Button
        zoom_out!: Phaser.Button

        // Options button
        button_options!: Phaser.Button

        /**
         * Init the view, binding it to a universe
         */
        init(universe: Universe, player: Player) {
            super.init();

            this.universe = universe;
            this.player = player;
        }

        /**
         * Create view graphics
         */
        create() {
            super.create();

            let builder = new UIBuilder(this);

            this.layer_universe = this.getLayer("universe");
            this.layer_overlay = this.getLayer("overlay");

            this.starlinks_group = this.game.add.group(this.layer_universe);
            this.starlinks = this.universe.starlinks.map(starlink => {
                let loc1 = starlink.first.getWarpLocationTo(starlink.second);
                let loc2 = starlink.second.getWarpLocationTo(starlink.first);

                let result = new Phaser.Graphics(this.game);
                if (loc1 && loc2) {
                    result.lineStyle(0.01, 0x6cc7ce);
                    result.moveTo(starlink.first.x - 0.5 + loc1.x, starlink.first.y - 0.5 + loc1.y);
                    result.lineTo(starlink.second.x - 0.5 + loc2.x, starlink.second.y - 0.5 + loc2.y);
                }
                result.data.link = starlink;
                return result;
            });
            this.starlinks.forEach(starlink => this.starlinks_group.add(starlink));

            this.player_fleet = new FleetDisplay(this, this.player.fleet);

            this.starsystems = this.universe.stars.map(star => new StarSystemDisplay(this, star));
            this.starsystems.forEach(starsystem => this.layer_universe.add(starsystem));

            this.layer_universe.add(this.player_fleet);

            this.current_location = new CurrentLocationMarker(this, this.player_fleet);
            this.layer_universe.add(this.current_location);

            this.mission_markers = new MissionLocationMarker(this, this.layer_universe);

            this.actions = new MapLocationMenu(this);
            this.actions.setPosition(30, 30);
            this.actions.moveToLayer(this.layer_overlay);

            this.missions = new ActiveMissionsDisplay(this, this.player.missions, this.mission_markers);
            this.missions.setPosition(20, 720);
            this.missions.moveToLayer(this.layer_overlay);

            builder.in(this.layer_overlay, builder => {
                this.zoom_in = builder.button("map-zoom-in", 1787, 54, () => this.setZoom(this.zoom + 1), "Zoom in");
                this.zoom_out = builder.button("map-zoom-out", 1787, 840, () => this.setZoom(this.zoom - 1), "Zoom out");
                this.button_options = builder.button("map-options", 1628, 0, () => this.showOptions(), "Game options");
            });

            this.character_sheet = new CharacterSheet(this, CharacterSheetMode.EDITION);
            this.layer_overlay.add(this.character_sheet);

            this.conversation = new MissionConversationDisplay(this);
            this.conversation.moveToLayer(this.layer_overlay);

            this.gameui.audio.startMusic("spring-thaw");

            // Inputs
            this.inputs.bind(" ", "Conversation step", () => this.conversation.forward());
            this.inputs.bind("Escape", "Skip conversation", () => this.conversation.skipConversation());
            this.inputs.bindCheat("r", "Reveal whole map", () => this.revealAll());
            this.inputs.bindCheat("n", "Next story step", () => {
                if (this.player.missions.main) {
                    this.player.missions.main.current_part.forceComplete();
                    this.backToRouter();
                }
            });

            this.setZoom(2, 0);

            // Add a shader background
            builder.shader("map-background", { width: this.getWidth(), height: this.getHeight() }, 0, 0, () => {
                let scale = this.layer_universe.scale.x;
                return {
                    offset: { x: (920 - this.layer_universe.x) / scale, y: -(540 - this.layer_universe.y) / scale },
                    scale: scale
                }
            });

            // Trigger an auto-save any time we go back to the map
            this.autoSave();
        }

        /**
         * Leaving the view, unbind and destroy
         */
        shutdown() {
            this.universe = new Universe();
            this.player = new Player();

            super.shutdown();
        }

        /**
         * Refresh the view
         */
        refresh() {
            if (this.player.getBattle()) {
                this.backToRouter();
            } else {
                this.setZoom(this.zoom);
                this.character_sheet.refresh();
                this.player_fleet.updateShipSprites();
            }
        }

        /**
         * Check active missions.
         * 
         * When any mission status changes, a refresh is triggered.
         */
        checkMissionsUpdate() {
            if (this.missions.checkUpdate()) {
                this.refresh();
            }
        }

        /**
         * Update info on all star systems (fog of war, available data...)
         */
        updateInfo(current_star: Star | null, interactive = true) {
            this.current_location.setZoom(this.zoom);
            if (current_star) {
                this.mission_markers.setZoom(this.zoom, current_star);
            }

            this.starlinks.forEach(linkgraphics => {
                let link = <StarLink>linkgraphics.data.link;
                linkgraphics.visible = this.player.hasVisitedSystem(link.first) || this.player.hasVisitedSystem(link.second);
            })

            this.starsystems.forEach(system => system.updateInfo(this.zoom, system.starsystem == current_star));

            this.actions.setFromLocation(this.session.getLocation(), this);

            this.missions.checkUpdate();
            this.conversation.updateFromMissions(this.player.missions, () => this.checkMissionsUpdate());

            if (interactive) {
                this.setInteractionEnabled(true);
            }
        }

        /**
         * Reveal the whole map (this is a cheat)
         */
        revealAll(): void {
            this.universe.stars.forEach(star => {
                star.locations.forEach(location => {
                    this.player.fleet.setVisited(location);
                });
            });
            this.refresh();
        }

        /**
         * Set the camera to center on a target, and to display a given span in height
         */
        setCamera(x: number, y: number, span: number, duration = 500, easing = Phaser.Easing.Cubic.InOut) {
            let scale = 1000 / span;
            let dest_x = 920 - x * scale;
            let dest_y = 540 - y * scale;
            if (duration) {
                this.tweens.create(this.layer_universe.position).to({ x: dest_x, y: dest_y }, duration, easing).start();
                this.tweens.create(this.layer_universe.scale).to({ x: scale, y: scale }, duration, easing).start();
            } else {
                this.layer_universe.position.set(dest_x, dest_y);
                this.layer_universe.scale.set(scale);
            }
        }

        /**
         * Set the camera to include all direct-jump accessible stars
         */
        setCameraOnAccessible(star: Star, duration: number) {
            let accessible = star.getNeighbors().concat([star]);
            let xmin = min(accessible.map(star => star.x));
            let xmax = max(accessible.map(star => star.x));
            let ymin = min(accessible.map(star => star.y));
            let ymax = max(accessible.map(star => star.y));
            let dmax = Math.max(xmax - xmin, ymax - ymin);
            this.setCamera(xmin + (xmax - xmin) * 0.5, ymin + (ymax - ymin) * 0.5, dmax * 1.2, duration);
        }

        /**
         * Set the alpha value for all links
         */
        setLinksAlpha(alpha: number, duration = 500) {
            if (duration) {
                this.game.add.tween(this.starlinks_group).to({ alpha: alpha }, duration * Math.abs(this.starlinks_group.alpha - alpha)).start();
            } else {
                this.starlinks_group.alpha = alpha;
            }
        }

        /**
         * Set the current zoom level (0, 1 or 2)
         */
        setZoom(level: number, duration = 500) {
            let current_star = this.session.getLocation().star;
            if (!current_star || level <= 0) {
                this.setCamera(0, 0, this.universe.radius * 2, duration);
                this.setLinksAlpha(1, duration);
                this.zoom = 0;
            } else if (level == 1) {
                this.setCameraOnAccessible(current_star, duration);
                this.setLinksAlpha(0.6, duration);
                this.zoom = 1;
            } else {
                this.setCamera(current_star.x - current_star.radius * 0.3, current_star.y, current_star.radius * 2, duration);
                this.setLinksAlpha(0.2, duration);
                this.zoom = 2;
            }

            this.updateInfo(current_star);
        }

        /**
         * Do the jump animation to another system
         * 
         * This will only work if current location is a warp
         */
        doJump(): void {
            let location = this.session.getLocation();
            if (this.interactive && location && location.type == StarLocationType.WARP && location.jump_dest) {
                let dest_location = location.jump_dest;
                let dest_star = dest_location.star;
                this.player_fleet.moveToLocation(dest_location, 3, duration => {
                    this.timer.schedule(duration / 2, () => this.updateInfo(dest_star, false));
                    this.setCamera(dest_star.x, dest_star.y, dest_star.radius * 2, duration, Phaser.Easing.Cubic.Out);
                }, () => {
                    this.setInteractionEnabled(true);
                    this.refresh();
                });
                this.setInteractionEnabled(false);
            }
        }

        /**
         * Open the dockyard interface
         * 
         * This will only work if current location has a dockyard
         */
        openShop(): void {
            let location = this.session.getLocation();
            if (this.interactive && location && location.shop) {
                this.character_sheet.show(this.player.fleet.ships[0]);
            }
        }

        /**
         * Open the missions dialog (job posting)
         * 
         * This will only work if current location has a dockyard
         */
        openMissions(): void {
            let location = this.session.getLocation();
            if (this.interactive && location && location.shop) {
                new MissionsDialog(this, location.shop, this.player, () => this.checkMissionsUpdate());
            }
        }

        /**
         * Move the fleet to another location
         */
        moveToLocation(dest: StarLocation): void {
            if (this.interactive && !dest.is(this.player.fleet.location)) {
                this.setInteractionEnabled(false);
                this.player_fleet.moveToLocation(dest, 1, null, () => {
                    this.setInteractionEnabled(true);
                    this.refresh();
                });
            }
        }

        /**
         * Set the interactive state
         */
        setInteractionEnabled(enabled: boolean) {
            this.interactive = enabled && !this.session.spectator;
            this.actions.setVisible(enabled && this.zoom == 2, 300);
            this.missions.setVisible(enabled && this.zoom == 2, 300);
            this.animations.setVisible(this.zoom_in, enabled && this.zoom < 2, 300);
            this.animations.setVisible(this.zoom_out, enabled && this.zoom > 0, 300);
            this.animations.setVisible(this.button_options, enabled, 300);
            this.animations.setVisible(this.character_sheet, enabled, 300);
        }
    }
}
