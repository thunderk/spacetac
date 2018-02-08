module TK.SpaceTac.UI {
    // Group to display a star system
    export class StarSystemDisplay extends Phaser.Image {
        view: UniverseMapView
        circles: Phaser.Group
        starsystem: Star
        player: Player
        fleet_display: FleetDisplay
        locations: [StarLocation, Phaser.Image, Phaser.Image][] = []
        label: Phaser.Button

        constructor(parent: UniverseMapView, starsystem: Star) {
            super(parent.game, starsystem.x, starsystem.y, "map-starsystem-background");

            this.view = parent;

            this.anchor.set(0.5, 0.5);

            let scale = this.width;
            this.scale.set(starsystem.radius * 2 / scale);

            this.starsystem = starsystem;
            this.player = parent.player;
            this.fleet_display = parent.player_fleet;

            // Show boundary
            this.circles = new Phaser.Group(this.game);
            this.addChild(this.circles);
            let boundaries = this.game.add.image(0, 0, "map-boundaries", 0, this.circles);
            boundaries.anchor.set(0.5);
            boundaries.scale.set(starsystem.radius / (this.scale.x * 256));

            // Show locations
            starsystem.locations.map(location => {
                let location_sprite: Phaser.Image | null = null;
                let fleet_move = () => this.view.moveToLocation(location);

                if (location.type == StarLocationType.STAR) {
                    location_sprite = this.addImage(location.x, location.y, "map-location-star", fleet_move);
                } else if (location.type == StarLocationType.PLANET) {
                    location_sprite = this.addImage(location.x, location.y, "map-location-planet", fleet_move);
                    location_sprite.rotation = Math.atan2(location.y, location.x);
                    this.addCircle(location.x, location.y);
                } else if (location.type == StarLocationType.WARP) {
                    location_sprite = this.addImage(location.x, location.y, "map-location-warp", fleet_move);
                    location_sprite.rotation = Math.atan2(location.y, location.x);
                }

                this.view.tooltip.bindDynamicText(<Phaser.Button>location_sprite, () => {
                    let visited = this.player.hasVisitedLocation(location);
                    let shop = (visited && !location.encounter && location.shop) ? " (dockyard present)" : "";

                    if (location.is(this.player.fleet.location)) {
                        return `Current fleet location${shop}`;
                    } else {
                        let loctype = StarLocationType[location.type].toLowerCase();
                        let danger = (visited && location.encounter) ? " [enemy fleet detected !]" : "";
                        return `${visited ? "Visited" : "Unvisited"} ${loctype} - Move the fleet there${danger}${shop}`;
                    }
                });

                if (location_sprite) {
                    let status = this.getBadgeFrame(location);
                    let status_badge = this.addImage(location.x + 0.005, location.y + 0.005, `map-status-${status}`);
                    this.locations.push([location, location_sprite, status_badge]);
                }
            });

            // Show name
            this.label = new Phaser.Button(this.game, 0, 460, "map-name");
            this.label.anchor.set(0.5, 0.5);
            this.label.input.useHandCursor = false;
            let label_content = new Phaser.Text(this.game, 0, 0, this.starsystem.name, { align: "center", font: `32pt SpaceTac`, fill: "#b8d2f1" });
            label_content.anchor.set(0.6, 0.5);
            this.label.addChild(label_content);
            let label_level = new Phaser.Text(this.game, 243, 30, this.starsystem.level.toString(), { align: "center", font: `24pt SpaceTac`, fill: "#a0a0a0" });
            label_level.anchor.set(0.6, 0.5);
            this.label.addChild(label_level);
            this.addChild(this.label);
            this.view.tooltip.bindStaticText(this.label, `Level ${this.starsystem.level} starsystem`);
        }

        addImage(x: number, y: number, name: string, onclick: Function | null = null): Phaser.Image {
            x /= this.scale.x;
            y /= this.scale.y;
            let info = this.view.getImageInfo(name);
            let image = onclick ? this.game.add.button(x, y, info.key, onclick, undefined, info.frame, info.frame) : this.game.add.image(x, y, info.key, info.frame);
            image.anchor.set(0.5, 0.5);
            this.addChild(image);
            return image;
        }

        /**
         * Add an orbit marker
         */
        addCircle(x: number, y: number): void {
            let radius = Math.sqrt(x * x + y * y);
            let angle = Math.atan2(y, x);

            let circle = this.game.add.image(0, 0, "map-orbit", 0, this.circles);
            circle.anchor.set(0.5);
            circle.scale.set(radius / (this.scale.x * 198));
            circle.rotation = angle - 0.01;

            this.circles.add(circle);
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
            this.children.filter(child => child !== this.label).forEach(child => this.view.animations.setVisible(child, detailed, 300));

            this.updateLabel(level);
        }

        /**
         * Update label position and scaling
         */
        updateLabel(zoom: number) {
            this.label.visible = this.player.hasVisitedSystem(this.starsystem);

            let factor = (zoom == 2) ? 1 : (zoom == 1 ? 5 : 15);
            this.view.tweens.create(this.label.scale).to({ x: factor, y: factor }, 500, Phaser.Easing.Cubic.InOut).start();

            let position = (zoom == 2) ? { x: -680, y: 440 } : { x: 0, y: (zoom == 1 ? 180 : 100) * factor };
            this.view.tweens.create(this.label.position).to(position, 500, Phaser.Easing.Cubic.InOut).start();
        }
    }
}
