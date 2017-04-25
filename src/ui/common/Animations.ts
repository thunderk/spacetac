module TS.SpaceTac.UI {
    interface PhaserGraphics {
        x: number;
        y: number;
        rotation: number;
        game: Phaser.Game;
    };

    /**
     * Interface of an object that may be enabled/disabled.
     */
    interface IAnimationEnableable {
        enabled: boolean
    }

    /**
     * Interface of an object that may be shown/hidden, with opacity transition.
     */
    interface IAnimationFadeable {
        alpha: number;
        visible: boolean;
        input?: IAnimationEnableable;
    }

    /**
     * Manager of all animations.
     * 
     * This is a wrapper around phaser's tweens.
     */
    export class Animations {
        private tweens: Phaser.TweenManager;

        constructor(tweens: Phaser.TweenManager) {
            this.tweens = tweens;
        }

        /**
         * Create a tween on an object.
         * 
         * If a previous tween is running for this object, it will be stopped, and a new one will be created.
         */
        private createTween(obj: any): Phaser.Tween {
            this.tweens.removeFrom(obj);
            let result = this.tweens.create(obj);
            return result;
        }

        /**
         * Simulate the tween currently applied to an object's property
         * 
         * This may be heavy work and should only be done in testing code.
         */
        simulate(obj: any, property: string, points = 5, duration = 1000): number[] {
            let tween = first(this.tweens.getAll().concat((<any>this.tweens)._add), tween => tween.target === obj && !tween.pendingDelete);
            if (tween) {
                return [obj[property]].concat(tween.generateData(points - 1).map(data => data[property]));
            } else {
                return [];
            }
        }

        /**
         * Display an object, with opacity transition
         */
        show(obj: IAnimationFadeable, duration = 1000, alpha = 1): void {
            if (!obj.visible) {
                obj.alpha = 0;
                obj.visible = true;
            }

            let tween = this.createTween(obj);
            tween.to({ alpha: alpha }, duration);
            if (obj.input) {
                let input = obj.input;
                tween.onComplete.addOnce(() => input.enabled = true);
            }
            tween.start();
        }

        /**
         * Hide an object, with opacity transition
         */
        hide(obj: IAnimationFadeable, duration = 1000): void {
            if (obj.input) {
                obj.input.enabled = false;
            }

            let tween = this.createTween(obj);
            tween.to({ alpha: 0 }, duration);
            tween.onComplete.addOnce(() => obj.visible = false);
            tween.start();
        }

        /**
         * Set an object visibility, with opacity transition
         */
        setVisible(obj: IAnimationFadeable, visible: boolean, duration = 1000): void {
            if (visible) {
                this.show(obj, duration);
            } else {
                this.hide(obj, duration);
            }
        }

        /**
         * Interpolate a rotation value
         * 
         * This will take into account the 2*pi modulo
         * 
         * Returns the duration
         */
        static rotationTween(tween: Phaser.Tween, dest: number, speed = 1, easing = Phaser.Easing.Cubic.InOut, property = "rotation"): number {
            // Immediately change the object's current rotation to be in range (-pi,pi)
            let value = Tools.normalizeAngle(tween.target[property]);
            tween.target[property] = value;

            // Compute destination angle
            dest = Tools.normalizeAngle(dest);
            if (value - dest > Math.PI) {
                dest += 2 * Math.PI;
            } else if (value - dest < -Math.PI) {
                dest -= 2 * Math.PI;
            }
            let distance = Math.abs(Tools.normalizeAngle(dest - value)) / Math.PI;
            let duration = distance * 1000 / speed;

            // Update the tween
            let changes = {};
            changes[property] = dest;
            tween.to(changes, duration, easing);

            return duration;
        }

        /**
         * Make an object move toward a location in space, with a ship-like animation.
         * 
         * Returns the animation duration.
         */
        static moveInSpace(obj: PhaserGraphics, x: number, y: number, angle: number, rotated_obj = obj): number {
            if (x == obj.x && y == obj.y) {
                let tween = obj.game.tweens.create(rotated_obj);
                let duration = Animations.rotationTween(tween, angle, 0.3);
                tween.start();
                return duration;
            } else {
                let distance = Target.newFromLocation(obj.x, obj.y).getDistanceTo(Target.newFromLocation(x, y));
                var tween = obj.game.tweens.create(obj);
                let duration = Math.sqrt(distance / 1000) * 3000;
                let curve_force = distance * 0.4;
                tween.to({
                    x: [obj.x + Math.cos(rotated_obj.rotation) * curve_force, x - Math.cos(angle) * curve_force, x],
                    y: [obj.y + Math.sin(rotated_obj.rotation) * curve_force, y - Math.sin(angle) * curve_force, y]
                }, duration, Phaser.Easing.Sinusoidal.InOut);
                tween.interpolation((v, k) => Phaser.Math.bezierInterpolation(v, k));
                let prevx = obj.x;
                let prevy = obj.y;
                tween.onUpdateCallback(() => {
                    if (prevx != obj.x || prevy != obj.y) {
                        rotated_obj.rotation = Math.atan2(obj.y - prevy, obj.x - prevx);
                    }
                    prevx = obj.x;
                    prevy = obj.y;
                });
                tween.start();
                return duration;
            }
        }
    }
}
