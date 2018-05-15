module TK.SpaceTac.UI {
    /**
     * Marker to show current location on the map
     */
    export class CurrentLocationMarker extends UIImage {
        private zoom = -1;
        private moving = false;
        private fleet: FleetDisplay;

        constructor(private view: UniverseMapView, fleet: FleetDisplay) {
            super(view, 0, 0, view.getImageInfo("map-current-location").key, view.getImageInfo("map-current-location").frame);

            this.fleet = fleet;

            this.setOrigin(0.5, 0.5);
            this.alpha = 0;
        }

        tweenTo(alpha: number, scale: number) {
            this.view.animations.addAnimation<UIImage>(this, { alpha: alpha, scaleX: scale, scaleY: scale }, 500);
        }

        show() {
            let scale = 1;
            if (this.zoom == 2) {
                this.setPosition(this.fleet.x, this.fleet.y);
                scale = this.fleet.scaleX * 4;
            } else {
                this.setPosition(this.fleet.location.star.x, this.fleet.location.star.y);
                scale = (this.zoom == 1) ? 0.002 : 0.016;
            }
            this.setAlpha(0);
            this.setScale(scale * 10);

            this.tweenTo(1, scale);
        }

        hide() {
            this.tweenTo(0, this.scaleX * 10);
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