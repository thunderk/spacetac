module TS.SpaceTac.UI {
    // Group to display a star system
    export class StarSystemDisplay extends Phaser.Image {
        view: UniverseMapView
        circles: Phaser.Group
        starsystem: Star
        player: Player
        fleet_display: FleetDisplay
        locations: [StarLocation, Phaser.Image, Phaser.Image][] = []
        label: Phaser.Image

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
            this.addCircle(starsystem.radius);

            // Show locations
            starsystem.locations.map(location => {
                let location_sprite: Phaser.Image | null = null;
                let fleet_move = () => {
                    if (location == this.player.fleet.location) {
                        if (location.shop) {
                            this.view.character_sheet.setShop(location.shop);
                            this.view.character_sheet.show(this.player.fleet.ships[0]);
                        }
                    } else {
                        this.fleet_display.moveToLocation(location);
                    }
                }

                if (location.type == StarLocationType.STAR) {
                    location_sprite = this.addImage(location.x, location.y, "map-location-star", fleet_move);
                } else if (location.type == StarLocationType.PLANET) {
                    location_sprite = this.addImage(location.x, location.y, "map-location-planet", fleet_move);
                    location_sprite.rotation = Math.atan2(location.y, location.x);
                    this.addCircle(Math.sqrt(location.x * location.x + location.y * location.y), 1);
                } else if (location.type == StarLocationType.WARP) {
                    location_sprite = this.addImage(location.x, location.y, "map-location-warp", fleet_move);
                }

                this.view.tooltip.bindDynamicText(<Phaser.Button>location_sprite, () => {
                    let visited = this.player.hasVisitedLocation(location);
                    let shop = (visited && !location.encounter && location.shop) ? " (shop present)" : "";

                    if (location == this.player.fleet.location) {
                        return `Current fleet location${shop}`;
                    } else {
                        let loctype = StarLocationType[location.type].toLowerCase();
                        let danger = (visited && location.encounter) ? " [enemy fleet detected !]" : "";
                        return `${visited ? "Visited" : "Unvisited"} ${loctype} - Move the fleet there${danger}${shop}`;
                    }
                });

                if (location_sprite) {
                    let key = this.getVisitedKey(location);
                    let status_badge = this.addImage(location.x + 0.005, location.y + 0.005, key);
                    this.locations.push([location, location_sprite, status_badge]);
                }
            });

            // Show name
            this.label = new Phaser.Image(this.game, 0, 460, "map-name");
            this.label.anchor.set(0.5, 0.5);
            let label_content = new Phaser.Text(this.game, 0, 0, this.starsystem.name, { align: "center", font: `32pt Arial`, fill: "#e2e3b8" })
            label_content.anchor.set(0.5, 0.5);
            this.label.addChild(label_content);
            this.addChild(this.label);
        }

        addImage(x: number, y: number, key: string, onclick: Function | null = null): Phaser.Image {
            x /= this.scale.x;
            y /= this.scale.y;
            let image = onclick ? this.game.add.button(x, y, key, onclick) : this.game.add.image(x, y, key);
            image.anchor.set(0.5, 0.5);
            this.addChild(image);
            return image;
        }

        addCircle(radius: number, width = 3, color = 0x424242): Phaser.Graphics {
            let circle = this.game.add.graphics(0, 0);
            circle.lineStyle(width, color);
            circle.drawCircle(0, 0, radius * 2 / this.scale.x);
            this.circles.add(circle);
            return circle;
        }

        /**
         * Return the sprite code to use for visited status.
         */
        getVisitedKey(location: StarLocation) {
            if (this.player.hasVisitedLocation(location)) {
                if (location.encounter) {
                    return "map-state-enemy";
                } else if (location.shop) {
                    return "map-state-shop";
                } else {
                    return "map-state-clear";
                }
            } else {
                return "map-state-unknown";
            }
        }

        /**
         * Update displayed information, and fog of war
         */
        updateInfo(level: number, focus: boolean) {
            this.locations.forEach(info => {
                info[2].loadTexture(this.getVisitedKey(info[0]));
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

            let position = (zoom == 2) ? { x: -460, y: 460 } : { x: 0, y: 100 * factor };
            this.view.tweens.create(this.label.position).to(position, 500, Phaser.Easing.Cubic.InOut).start();
        }
    }
}
