module TK.SpaceTac.UI {
    interface PhaserGraphics {
        x: number
        y: number
        rotation: number
    };

    /**
     * Interface of an object that may be shown/hidden, with opacity transition.
     */
    interface IAnimationFadeable {
        alpha: number
        visible: boolean
        input?: { enabled: boolean }
        changeStateFrame?: Function
        freezeFrames?: boolean
    }

    /**
     * Configuration object for blink animations
     */
    interface AnimationBlinkOptions {
        alpha_on?: number
        alpha_off?: number
        times?: number
        speed?: number
    }

    /**
     * Manager of all animations.
     * 
     * This is a wrapper around phaser's tweens.
     */
    export class Animations {
        private immediate = false

        constructor(private tweens: Phaser.Tweens.TweenManager) {
        }

        /**
         * Set all future animations to be immediate (and synchronous)
         * 
         * This is mostly useful in tests
         */
        setImmediate(immediate = true): void {
            this.immediate = immediate;
        }

        /**
         * Kill previous tweens currently running on an object's properties
         */
        killPrevious<T extends object>(obj: T, properties: Extract<keyof T, string>[]): void {
            this.tweens.getTweensOf(obj).forEach(tween => {
                if (tween.data && any(tween.data, data => bool(data.key) && contains(properties, data.key))) {
                    tween.stop();
                }
            });
        }

        /**
         * Simulate the tween currently applied to an object's property
         * 
         * This may be heavy work and should only be done in testing code.
         */
        simulate(obj: any, property: string, points = 5): number[] {
            this.tweens.preUpdate();
            let tween = first(this.tweens.getTweensOf(obj), tween => tween.isPlaying());
            if (tween) {
                let tween_obj = tween;
                tween_obj.update(0, 0);
                return range(points).map(i => {
                    tween_obj.seek(i / (points - 1));
                    return obj[property];
                });
            } else {
                return [];
            }
        }

        /**
         * Display an object, with opacity transition
         */
        show(obj: IAnimationFadeable, duration = 1000, alpha = 1): void {
            this.killPrevious(obj, ['alpha']);

            if (!obj.visible) {
                obj.alpha = 0;
                obj.visible = true;
            }

            let onComplete: Function | undefined;
            if (obj.input) {
                let input = obj.input;
                onComplete = () => {
                    input.enabled = true
                    obj.freezeFrames = false;
                };
            }

            if (duration && !this.immediate) {
                this.tweens.add({
                    targets: obj,
                    alpha: alpha,
                    duration: duration,
                    onComplete: onComplete
                })
            } else {
                obj.alpha = alpha;
                if (onComplete) {
                    onComplete();
                }
            }
        }

        /**
         * Hide an object, with opacity transition
         */
        hide(obj: IAnimationFadeable, duration = 1000, alpha = 0): void {
            this.killPrevious(obj, ['alpha']);

            if (obj.changeStateFrame) {
                obj.changeStateFrame("Out");
                obj.freezeFrames = true;
            }

            if (obj.input) {
                obj.input.enabled = false;
            }

            let onComplete = () => obj.visible = alpha > 0;

            if (duration && !this.immediate) {
                this.tweens.add({
                    targets: obj,
                    alpha: alpha,
                    duration: duration,
                    onComplete: onComplete
                });
            } else {
                obj.alpha = alpha;
                onComplete();
            }
        }

        /**
         * Set an object visibility, with opacity transition
         */
        setVisible(obj: IAnimationFadeable, visible: boolean, duration = 1000, alphaon = 1, alphaoff = 0): void {
            if (visible) {
                this.show(obj, duration, alphaon);
            } else {
                this.hide(obj, duration, alphaoff);
            }
        }

        /**
         * Get a toggle on visibility
         */
        newVisibilityToggle(obj: IAnimationFadeable, duration = 1000, initial = true): Toggle {
            let result = new Toggle(() => this.setVisible(obj, true, duration), () => this.setVisible(obj, false, duration));
            this.setVisible(obj, initial, 0);
            return result;
        }

        /**
         * Add an asynchronous animation to an object.
         */
        addAnimation<T extends object>(obj: T, properties: Partial<T>, duration: number, ease = "Linear", delay = 0, loop = 1, yoyo = false): Promise<void> {
            this.killPrevious(obj, keys(properties));

            if (!duration) {
                copyfields(properties, obj);
                return Promise.resolve();
            }

            return new Promise(resolve => {
                this.tweens.add(merge<object>({
                    targets: obj,
                    ease: ease,
                    duration: duration,
                    delay: delay,
                    loop: loop - 1,
                    onComplete: resolve,
                    yoyo: yoyo
                }, properties));

                // By security, if the tween is destroyed before completion, we resolve the promise using the timer
                Timer.global.schedule(delay + duration, resolve);
            });
        }

        /**
         * Catch the player eye with a blink effect
         */
        async blink(obj: { alpha: number }, config: AnimationBlinkOptions = {}): Promise<void> {
            let speed = coalesce(config.speed, 1);
            let alpha_on = coalesce(config.alpha_on, 1);

            if (!speed) {
                obj.alpha = alpha_on;
            }

            let alpha_off = coalesce(config.alpha_off, 0.3);
            let times = coalesce(config.times, 3);

            if (obj.alpha != alpha_on) {
                await this.addAnimation(obj, { alpha: alpha_on }, 150 / speed);
            }
            for (let i = 0; i < times; i++) {
                await this.addAnimation(obj, { alpha: alpha_off }, 150 / speed);
                await this.addAnimation(obj, { alpha: alpha_on }, 150 / speed);
            }
        }

        /**
         * Interpolate a rotation value
         * 
         * This will take into account the 2*pi modulo
         * 
         * Returns the duration
         */
        rotationTween(obj: Phaser.GameObjects.Components.Transform, dest: number, speed = 1, easing = "Cubic.easeInOut"): Promise<void> {
            // Immediately change the object's current rotation to be in range (-pi,pi)
            let value = UITools.normalizeAngle(obj.rotation);
            obj.setRotation(value);

            // Compute destination angle
            dest = UITools.normalizeAngle(dest);
            if (value - dest > Math.PI) {
                dest += 2 * Math.PI;
            } else if (value - dest < -Math.PI) {
                dest -= 2 * Math.PI;
            }
            let distance = Math.abs(UITools.normalizeAngle(dest - value)) / Math.PI;
            let duration = distance * 2000 / speed;

            // Tween
            return this.addAnimation(obj, { rotation: dest }, duration, easing);
        }

        /**
         * Move an object linearly to another position
         * 
         * Returns the animation duration.
         */
        moveTo(obj: Phaser.GameObjects.Components.Transform, x: number, y: number, angle: number, rotated_obj = obj, speed = 1, ease = true): Promise<void> {
            let duration = arenaDistance(obj, { x: x, y: y }) * 2 / speed;

            return Promise.all([
                this.rotationTween(rotated_obj, angle, speed, ease ? "Cubic.easeInOut" : "Linear"),
                this.addAnimation(obj, { x: x, y: y }, duration, ease ? "Quad.easeInOut" : "Linear"),
            ]).then(nop);
        }

        /**
         * Make an object move toward a location in space, with a ship-like animation.
         * 
         * Returns the animation duration.
         */
        moveInSpace(obj: Phaser.GameObjects.Components.Transform, x: number, y: number, angle: number, rotated_obj = obj, speed = 1): Promise<void> {
            this.killPrevious(obj, ["x", "y"]);

            if (x == obj.x && y == obj.y) {
                let distance = Math.abs(angularDifference(rotated_obj.rotation, angle));
                return this.rotationTween(rotated_obj, angle, speed);
            } else {
                this.killPrevious(rotated_obj, ["rotation"]);
                let distance = Target.newFromLocation(obj.x, obj.y).getDistanceTo(Target.newFromLocation(x, y));
                let duration = Math.sqrt(distance / 1000) * 3000 / speed;
                let curve_force = distance * 0.4;
                let prevx = obj.x;
                let prevy = obj.y;
                let xpts = [obj.x, obj.x + Math.cos(rotated_obj.rotation) * curve_force, x - Math.cos(angle) * curve_force, x];
                let ypts = [obj.y, obj.y + Math.sin(rotated_obj.rotation) * curve_force, y - Math.sin(angle) * curve_force, y];
                let fobj = { t: 0 };
                return new Promise(resolve => {
                    this.tweens.add({
                        targets: [fobj],
                        t: 1,
                        duration: duration,
                        ease: "Sine.easeInOut",
                        onComplete: resolve,
                        onUpdate: () => {
                            obj.setPosition(
                                Phaser.Math.Interpolation.CubicBezier(fobj.t, xpts[0], xpts[1], xpts[2], xpts[3]),
                                Phaser.Math.Interpolation.CubicBezier(fobj.t, ypts[0], ypts[1], ypts[2], ypts[3]),
                            )
                            if (prevx != obj.x || prevy != obj.y) {
                                rotated_obj.setRotation(Math.atan2(obj.y - prevy, obj.x - prevx));
                            }
                            prevx = obj.x;
                            prevy = obj.y;
                        }
                    })
                });
            }
        }
    }
}
