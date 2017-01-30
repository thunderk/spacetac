module TS.SpaceTac.View {
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
    export class FleetDisplay extends Phaser.Group {
        private map: UniverseMapView;
        private fleet: Game.Fleet;
        private tween: Phaser.Tween;

        constructor(parent: UniverseMapView, fleet: Game.Fleet) {
            super(parent.game);

            this.map = parent;
            this.fleet = fleet;

            fleet.ships.forEach((ship, index) => {
                let offset = LOCATIONS[index];
                let sprite = this.game.add.image(offset[0], offset[1] + 150, `ship-${ship.model}-sprite`, 0, this);
                sprite.anchor.set(0.5, 0.5);
            });

            this.position.set(fleet.location.star.x + fleet.location.x, fleet.location.star.y + fleet.location.y);
            this.scale.set(SCALING, SCALING);

            this.tween = this.game.tweens.create(this);
            this.loopOrbit();
        }

        /**
         * Animate to a given position in orbit of its current star location
         */
        goToOrbitPoint(angle: number, speed = 1, then: Function | null = null, ease = false) {
            this.tween.stop(false);
            this.rotation %= PI2;

            let target = -angle;
            while (target >= this.rotation) {
                target -= PI2;
            }
            let distance = Math.abs(target - this.rotation) / PI2;
            this.tween = this.game.tweens.create(this).to({ rotation: target }, 30000 * distance / speed, ease ? Phaser.Easing.Cubic.In : Phaser.Easing.Linear.None);
            if (then) {
                this.tween.onComplete.addOnce(then);
            }
            this.tween.start();
        }

        /**
         * Make the fleet loop in orbit
         */
        loopOrbit() {
            this.goToOrbitPoint(this.rotation + PI2, 1, () => {
                this.loopOrbit();
            });
        }

        /**
         * Make the fleet move to another location in the same system
         */
        moveToLocation(location: Game.StarLocation) {
            if (location != this.fleet.location) {
                let dx = location.x - this.fleet.location.x;
                let dy = location.y - this.fleet.location.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let angle = Math.atan2(dx, dy);
                this.goToOrbitPoint(angle - Math.PI / 2, 20, () => {
                    let tween = this.game.tweens.create(this.position).to({ x: this.x + dx, y: this.y + dy }, 10000 * distance, Phaser.Easing.Cubic.Out);
                    tween.onComplete.addOnce(() => {
                        this.fleet.setLocation(location);
                        if (this.fleet.battle) {
                            this.game.state.start("router");
                        } else {
                            this.map.updateInfo();
                            this.loopOrbit();
                        }
                    });
                    tween.start();
                }, true);
            }
        }
    }
}