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
        private ship_count = 0
        private is_moving = false

        constructor(private map: BaseView, private fleet: Fleet, private universe: Universe, private location_marker?: CurrentLocationMarker, orbit = true) {
            super(map);

            this.updateShipSprites();

            let location = this.universe.getLocation(fleet.location);
            if (location) {
                this.setPosition(location.star.x + location.x, location.star.y + location.y);
            }
            this.setScale(SCALING, SCALING);

            if (orbit) {
                this.loopOrbit();
            }
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
            return this.universe.getLocation(this.fleet.location) || new StarLocation();
        }

        /**
         * Animate to a given position in orbit of its current star location
         */
        async goToOrbitPoint(angle: number, speed = 1, fullturns = 0, ease = false): Promise<void> {
            this.map.animations.killPrevious<UIContainer>(this, ["angle"]);
            this.rotation %= PI2;

            let target = -angle;
            while (target >= this.rotation) {
                target -= PI2;
            }
            target -= PI2 * fullturns;
            let distance = Math.abs(target - this.rotation) / PI2;
            await this.map.animations.addAnimation<UIContainer>(this, { rotation: target }, 30000 * distance / speed, ease ? "Cubic.easeIn" : "Linear");
        }

        /**
         * Make the fleet loop in orbit
         */
        loopOrbit() {
            if (!this.is_moving) {
                this.goToOrbitPoint(this.rotation + PI2, 1, 0).then(() => this.loopOrbit());
            }
        }

        /**
         * Make the fleet move to another location in the same system
         */
        moveToLocation(location: StarLocation, speed = 1, on_leave: ((duration: number) => any) | null = null, on_finished: Function | null = null) {
            let fleet_location = this.universe.getLocation(this.fleet.location);
            if (fleet_location && this.fleet.move(location)) {
                let dx = location.universe_x - fleet_location.universe_x;
                let dy = location.universe_y - fleet_location.universe_y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let angle = Math.atan2(-dy, dx);
                this.setMoving(true);
                this.goToOrbitPoint(angle, 40, 1, true).then(() => {
                    this.setRotation(-angle);
                    let duration = 10000 * distance / speed;
                    if (on_leave) {
                        on_leave(duration);
                    }
                    let tween = this.map.animations.addAnimation<UIContainer>(this, { x: this.x + dx, y: this.y + dy }, duration, "Cubic.easeOut");
                    tween.then(() => {
                        if (this.fleet.battle) {
                            this.map.backToRouter();
                        } else {
                            this.setMoving(false);
                            this.loopOrbit();
                        }

                        if (on_finished) {
                            on_finished();
                        }
                    });
                });
            }
        }

        /**
         * Display a jump flash effect
         */
        async showJumpEffect(lag = 0, duration = 0): Promise<void> {
            this.map.audio.playOnce(lag ? "map-warp-out" : "map-warp-in");
            let effect = this.getBuilder().image("map-jump-effect", 0, 150, true);
            effect.setScale(0.01);
            effect.setZ(-1);
            if (lag && duration) {
                this.map.animations.addAnimation(effect, { x: -lag / SCALING }, duration * 0.5, "Cubic.easeOut");
            }
            await this.map.animations.addAnimation(effect, { scaleX: 3, scaleY: 3 }, 100);
            await this.map.animations.addAnimation(effect, { scaleX: 2, scaleY: 2, alpha: 0 }, 200);
            effect.destroy();
        }

        /**
         * Mark the fleet as moving
         */
        private setMoving(moving: boolean): void {
            this.is_moving = moving;
            if (this.location_marker) {
                this.location_marker.setFleetMoving(moving);
            }
        }
    }
}