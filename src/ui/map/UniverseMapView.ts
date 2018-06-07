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
        layer_universe!: UIContainer
        layer_overlay!: UIContainer

        // Star systems
        starsystems: StarSystemDisplay[] = []

        // Links between stars
        starlinks_group!: UIContainer
        starlinks: UIGraphics[] = []

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
        zoom_in!: UIButton
        zoom_out!: UIButton

        // Options button
        button_options!: UIButton

        /**
         * Init the view, binding it to a universe
         */
        init(data: { universe: Universe, player: Player }) {
            super.init(data);

            this.universe = data.universe;
            this.player = data.player;
        }

        /**
         * Create view graphics
         */
        create() {
            super.create();

            let builder = new UIBuilder(this);

            this.layer_universe = this.getLayer("universe");
            this.layer_overlay = this.getLayer("overlay");

            this.starlinks_group = builder.in(this.layer_universe).container("starlinks");
            this.starlinks = [];
            this.starlinks = this.universe.starlinks.map(starlink => {
                let loc1 = starlink.first.getWarpLocationTo(starlink.second);
                let loc2 = starlink.second.getWarpLocationTo(starlink.first);

                let result = builder.in(this.starlinks_group).graphics("starlink");
                if (loc1 && loc2) {
                    result.addLine({
                        start: { x: starlink.first.x + loc1.x, y: starlink.first.y + loc1.y },
                        end: { x: starlink.second.x + loc2.x, y: starlink.second.y + loc2.y },
                        color: 0x6cc7ce,
                        width: 0.01,
                    });
                }
                result.setDataEnabled();
                result.data.set("link", starlink);
                return result;
            });

            this.starsystems = this.universe.stars.map(star => new StarSystemDisplay(this, star));
            this.starsystems.forEach(starsystem => this.layer_universe.add(starsystem));

            this.player_fleet = new FleetDisplay(this, this.player.fleet);
            this.layer_universe.add(this.player_fleet);

            this.current_location = new CurrentLocationMarker(this, this.player_fleet);
            this.layer_universe.add(this.current_location);

            this.mission_markers = new MissionLocationMarker(this, this.layer_universe);

            this.actions = new MapLocationMenu(this, this.layer_overlay, 30, 30);

            this.missions = new ActiveMissionsDisplay(this, this.player.missions, this.mission_markers);
            this.missions.setPosition(20, 720);
            this.missions.moveToLayer(this.layer_overlay);

            builder.in(this.layer_overlay, builder => {
                this.zoom_in = builder.button("map-zoom-in", 1787, 54, () => this.setZoom(this.zoom + 1), "Zoom in");
                this.zoom_out = builder.button("map-zoom-out", 1787, 840, () => this.setZoom(this.zoom - 1), "Zoom out");
                this.button_options = builder.button("map-options", 1628, 0, () => this.showOptions(), "Game options");
            });

            this.character_sheet = new CharacterSheet(this, CharacterSheetMode.EDITION);
            this.character_sheet.moveToLayer(this.layer_overlay);

            this.conversation = new MissionConversationDisplay(builder.in(this.layer_overlay));

            this.audio.startMusic("spring-thaw");

            // Inputs
            this.inputs.bind(" ", "Conversation step", () => this.conversation.forward());
            this.inputs.bind("Escape", "Skip conversation", () => this.conversation.skipConversation());
            this.inputs.bindCheat("r", "Reveal whole map", () => this.revealAll());
            this.inputs.bindCheat("u", "Level up", () => {
                this.player.fleet.ships.forEach(ship => ship.level.forceLevelUp());
                this.refresh();
            });
            this.inputs.bindCheat("n", "Next story step", () => {
                if (this.player.missions.main) {
                    this.player.missions.main.current_part.forceComplete();
                    this.backToRouter();
                }
            });

            this.setZoom(2, 0);

            // Add a background
            //builder.image("map-background");

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
                let link = linkgraphics.data.get("link");
                if (link instanceof StarLink) {
                    linkgraphics.visible = this.player.hasVisitedSystem(link.first) || this.player.hasVisitedSystem(link.second);
                }
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
        setCamera(x: number, y: number, span: number, duration = 500, easing = "Cubic.easeInOut") {
            let scale = 1000 / span;
            let dest_x = 920 - x * scale;
            let dest_y = 540 - y * scale;
            if (duration) {
                this.animations.addAnimation(this.layer_universe, { x: dest_x, y: dest_y, scaleX: scale, scaleY: scale }, duration, easing);
            } else {
                this.layer_universe.setPosition(dest_x, dest_y);
                this.layer_universe.setScale(scale);
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
                this.animations.addAnimation(this.starlinks_group, { alpha: alpha }, duration * Math.abs(this.starlinks_group.alpha - alpha));
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
                    this.setCamera(dest_star.x, dest_star.y, dest_star.radius * 2, duration, "Cubic.Out");
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
            this.animations.setVisible(this.actions.container, enabled && this.zoom == 2, 300);
            this.missions.setVisible(enabled && this.zoom == 2, 300);
            this.animations.setVisible(this.zoom_in, enabled && this.zoom < 2, 300);
            this.animations.setVisible(this.zoom_out, enabled && this.zoom > 0, 300);
            this.animations.setVisible(this.button_options, enabled, 300);
            //this.animations.setVisible(this.character_sheet, enabled, 300);
        }
    }
}
