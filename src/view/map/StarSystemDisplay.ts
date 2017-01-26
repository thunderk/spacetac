module SpaceTac.View {
    // Group to display a star system
    export class StarSystemDisplay extends Phaser.Image {
        starsystem: Game.Star;

        constructor(parent: UniverseMapView, starsystem: Game.Star) {
            super(parent.game, starsystem.x, starsystem.y, "map-starsystem-background");
            this.anchor.set(0.5, 0.5);

            let scale = this.width;
            this.scale.set(starsystem.radius * 2 / scale);

            this.starsystem = starsystem;

            let boundary = this.game.add.graphics(0, 0);
            boundary.lineStyle(3, 0x424242);
            boundary.drawCircle(0, 0, scale);
            this.addChild(boundary);

            starsystem.locations.forEach(location => {
                if (location.type == Game.StarLocationType.STAR) {
                    this.addImage(location.x, location.y, "map-star");
                } else if (location.type == Game.StarLocationType.PLANET) {
                    let planet = this.addImage(location.x, location.y, "map-planet");
                    planet.rotation = Math.atan2(location.y, location.x);
                }
            });
        }

        addImage(x: number, y: number, key: string): Phaser.Image {
            let image = this.game.add.image(x * 0.5 / this.scale.x, y * 0.5 / this.scale.y, key);
            image.anchor.set(0.5, 0.5);
            this.addChild(image);
            return image;
        }
    }
}
