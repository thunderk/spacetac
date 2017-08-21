module TS.SpaceTac.UI {
    /**
     * Marker to show current location on the map
     */
    export class CurrentLocationMarker extends Phaser.Image {
        private zoom = -1;
        private moving = false;
        private fleet: FleetDisplay;

        constructor(parent: UniverseMapView, fleet: FleetDisplay) {
            super(parent.game, 0, 0, parent.getImageInfo("map-current-location").key, parent.getImageInfo("map-current-location").frame);

            this.fleet = fleet;

            this.anchor.set(0.5, 0.5);
            this.alpha = 0;
        }

        tweenTo(alpha: number, scale: number) {
            this.game.tweens.removeFrom(this);
            this.game.tweens.removeFrom(this.scale);

            this.game.tweens.create(this).to({ alpha: alpha }, 500).start();
            this.game.tweens.create(this.scale).to({ x: scale, y: scale }, 500).start();
        }

        show() {
            let scale = 1;
            if (this.zoom == 2) {
                this.position.set(this.fleet.x, this.fleet.y);
                scale = this.fleet.scale.x * 4;
            } else {
                this.position.set(this.fleet.location.star.x, this.fleet.location.star.y);
                scale = (this.zoom == 1) ? 0.002 : 0.016;
            }
            this.alpha = 0;
            this.scale.set(scale * 10, scale * 10);

            this.tweenTo(1, scale);
        }

        hide() {
            this.tweenTo(0, this.scale.x * 10);
        }

        setZoom(level: number) {
            if (level != this.zoom) {
                this.zoom = level;

                if (!this.moving) {
                    this.show();
                }
            }
        }

        setFleetMoving(moving: boolean) {
            if (moving != this.moving) {
                this.moving = moving;
                if (moving) {
                    this.hide();
                } else {
                    this.show();
                }
            }
        }
    }
}