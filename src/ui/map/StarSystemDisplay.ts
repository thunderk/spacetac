module TK.SpaceTac.UI {
    /**
     * Group to display a star system
     */
    export class StarSystemDisplay extends UIContainer {
        view: UniverseMapView
        builder: UIBuilder
        circles: UIContainer
        starsystem: Star
        player: Player
        fleet_display: FleetDisplay
        locations: [StarLocation, UIImage | UIButton, UIImage][] = []
        label: UIButton

        constructor(parent: UniverseMapView, starsystem: Star) {
            super(parent, starsystem.x, starsystem.y);

            this.view = parent;
            this.builder = new UIBuilder(parent, this);

            let base = this.builder.image("map-starsystem-background", 0, 0, true);
            this.setScale(starsystem.radius * 2 / base.width);

            this.starsystem = starsystem;
            this.player = parent.player;
            this.fleet_display = parent.player_fleet;

            // Show boundary
            this.circles = this.builder.container("circles");
            let boundaries = this.builder.in(this.circles).image("map-boundaries", 0, 0, true);
            boundaries.setScale(starsystem.radius / (this.scaleX * 256));

            // Show locations
            starsystem.locations.map(location => {
                let location_sprite: UIImage | UIButton | null = null;
                let loctype = StarLocationType[location.type].toLowerCase();

                location_sprite = this.builder.button(`map-location-${loctype}`, location.x / this.scaleX, location.y / this.scaleY,
                    () => this.view.moveToLocation(location),
                    (filler: TooltipBuilder) => {
                        let visited = this.player.hasVisitedLocation(location);
                        let shop = (visited && !location.encounter && location.shop) ? " (dockyard present)" : "";

                        if (location.is(this.player.fleet.location)) {
                            return `Current fleet location${shop}`;
                        } else {
                            let danger = (visited && location.encounter) ? " [enemy fleet detected !]" : "";
                            return `${visited ? "Visited" : "Unvisited"} ${loctype} - Move the fleet there${danger}${shop}`;
                        }
                    }, undefined, { center: true });

                location_sprite.setRotation(Math.atan2(location.y, location.x));
                if (location.type == StarLocationType.PLANET) {
                    this.addOrbit(location.x, location.y);
                }

                let status = this.getBadgeFrame(location);
                let status_badge = this.builder.image(`map-status-${status}`, (location.x + 0.005) / this.scaleX, (location.y + 0.005) / this.scaleY, true);
                this.locations.push([location, location_sprite, status_badge]);
            });

            // Show name
            this.label = this.builder.button("map-name", 0, 460, undefined, `Level ${this.starsystem.level} starsystem`, undefined, { center: true });
            this.builder.in(this.label, builder => {
                builder.text(this.starsystem.name, -30, 0, { size: 32, color: "#b8d2f1" });
                builder.text(this.starsystem.level.toString(), 243, 30, { size: 24, color: "#a0a0a0" });
            });
        }

        /**
         * Add an orbit marker
         */
        addOrbit(x: number, y: number): void {
            let radius = Math.sqrt(x * x + y * y);
            let angle = Math.atan2(y, x);

            let circle = this.builder.in(this.circles).image("map-orbit", 0, 0, true);
            circle.setScale(radius / (this.scaleX * 198));
            circle.rotation = angle - 0.01;
        }

        /**
         * Return the frame to use for info badge.
         */
        getBadgeFrame(location: StarLocation): string {
            if (this.player.hasVisitedLocation(location)) {
                if (location.encounter) {
                    return "enemy";
                } else if (location.shop) {
                    return "dockyard";
                } else {
                    return "clear";
                }
            } else {
                return "unvisited";
            }
        }

        /**
         * Update displayed information, and fog of war
         */
        updateInfo(level: number, focus: boolean) {
            this.locations.forEach(info => {
                let status = this.getBadgeFrame(info[0]);
                this.view.changeImage(info[2], `map-status-${status}`);
            });

            // LOD
            let detailed = focus && level == 2;
            this.list.filter(child => child !== this.label).forEach(child => {
                if (child !== this.label && (child instanceof UIButton || child instanceof UIImage)) {
                    this.view.animations.setVisible(child, detailed, 300);
                }
            });

            this.updateLabel(level);
        }

        /**
         * Update label position and scaling
         */
        updateLabel(zoom: number) {
            this.label.visible = this.player.hasVisitedSystem(this.starsystem);

            let factor = (zoom == 2) ? 1 : (zoom == 1 ? 5 : 15);
            let position = (zoom == 2) ? { x: -680, y: 440 } : { x: 0, y: (zoom == 1 ? 180 : 100) * factor };
            this.view.animations.addAnimation(this.label, { x: position.x, y: position.y, scaleX: factor, scaleY: factor }, 500, "Cubic.easeInOut");
        }
    }
}
