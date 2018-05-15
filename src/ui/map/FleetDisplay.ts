module TK.SpaceTac.UI {
    const SCALING = 0.00005;
    const LOCATIONS: [number, number][] = [
        [80, 0],
        [0, -50],
        [0, 50],
        [-80, 0],
        [0, 0],
    ];
    const PI2 = Math.PI * 2;

    /**
     * Group to display a fleet
     */
    export class FleetDisplay extends UIContainer {
        private map: UniverseMapView
        private fleet: Fleet
        private ship_count = 0

        constructor(parent: UniverseMapView, fleet: Fleet) {
            super(parent);

            this.map = parent;
            this.fleet = fleet;

            this.updateShipSprites();

            let location = this.map.universe.getLocation(fleet.location);
            if (location) {
                this.setPosition(location.star.x + location.x, location.star.y + location.y);
            }
            this.setScale(SCALING, SCALING);

            this.loopOrbit();
        }

        /**
         * Update the ship sprites
         */
        updateShipSprites() {
            if (this.ship_count != this.fleet.ships.length) {
                let builder = new UIBuilder(this.map, this);

                builder.clear();

                this.fleet.ships.forEach((ship, index) => {
                    let offset = LOCATIONS[index];
                    let sprite = builder.image(`ship-${ship.model.code}-sprite`, offset[0], offset[1] + 150, true);
                    sprite.setScale(64 / sprite.width);
                });

                this.ship_count = this.fleet.ships.length;
            }
        }

        get location(): StarLocation {
            return this.map.universe.getLocation(this.fleet.location) || new StarLocation();
        }

        /**
         * Animate to a given position in orbit of its current star location
         */
        goToOrbitPoint(angle: number, speed = 1, fullturns = 0, then: Function | null = null, ease = false) {
            this.map.animations.killPrevious(this);
            this.rotation %= PI2;

            let target = -angle;
            while (target >= this.rotation) {
                target -= PI2;
            }
            target -= PI2 * fullturns;
            let distance = Math.abs(target - this.rotation) / PI2;
            let tween = this.map.animations.addAnimation<UIContainer>(this, { rotation: target }, 30000 * distance / speed, ease ? "Cubic.easeIn" : "Linear");
            if (then) {
                tween.then(() => then());
            }
        }

        /**
         * Make the fleet loop in orbit
         */
        loopOrbit() {
            this.goToOrbitPoint(this.rotation + PI2, 1, 0, () => {
                this.loopOrbit();
            });
        }

        /**
         * Make the fleet move to another location in the same system
         */
        moveToLocation(location: StarLocation, speed = 1, on_leave: ((duration: number) => any) | null = null, on_finished: Function | null = null) {
            let fleet_location = this.map.universe.getLocation(this.fleet.location);
            if (fleet_location && this.fleet.move(location)) {
                let dx = location.universe_x - fleet_location.universe_x;
                let dy = location.universe_y - fleet_location.universe_y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let angle = Math.atan2(dx, dy);
                this.map.current_location.setFleetMoving(true);
                this.goToOrbitPoint(angle - Math.PI / 2, 40, 1, () => {
                    let duration = 10000 * distance / speed;
                    if (on_leave) {
                        on_leave(duration);
                    }
                    let tween = this.map.animations.addAnimation<UIContainer>(this, { x: this.x + dx, y: this.y + dy }, duration, "Cubic.easeOut");
                    tween.then(() => {
                        if (this.fleet.battle) {
                            this.map.backToRouter();
                        } else {
                            this.map.current_location.setFleetMoving(false);
                            this.loopOrbit();
                        }

                        if (on_finished) {
                            on_finished();
                        }
                    });
                }, true);
            }
        }
    }
}