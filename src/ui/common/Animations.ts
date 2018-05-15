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
     * Manager of all animations.
     * 
     * This is a wrapper around phaser's tweens.
     */
    export class Animations {
        private tweens: Phaser.Tweens.TweenManager
        private immediate = false

        constructor(tweens: Phaser.Tweens.TweenManager) {
            this.tweens = tweens;
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
         * Kill previous tweens from an object
         */
        killPrevious(obj: object): void {
            // TODO Only updated properties
            this.tweens.killTweensOf(obj);
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
            this.killPrevious(obj);

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
            this.killPrevious(obj);

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
            return new Promise((resolve, reject) => {
                this.killPrevious(obj);

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
        async blink(obj: any, alpha_on = 1, alpha_off = 0.3, times = 3): Promise<void> {
            if (obj.alpha != alpha_on) {
                await this.addAnimation(obj, { alpha: alpha_on }, 150);
            }
            for (let i = 0; i < times; i++) {
                await this.addAnimation(obj, { alpha: alpha_off }, 150);
                await this.addAnimation(obj, { alpha: alpha_on }, 150);
            }
        }

        /**
         * Interpolate a rotation value
         * 
         * This will take into account the 2*pi modulo
         * 
         * Returns the duration
         */
        rotationTween(obj: Phaser.GameObjects.Components.Transform, dest: number, speed = 1, easing = "Cubic.easeInOut"): number {
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
            let duration = distance * 1000 / speed;

            // Tween
            this.addAnimation(obj, { rotation: dest }, duration, easing);

            return duration;
        }

        /**
         * Move an object linearly to another position
         * 
         * Returns the animation duration.
         */
        moveTo(obj: Phaser.GameObjects.Components.Transform, x: number, y: number, angle: number, rotated_obj = obj, ease = true): number {
            let duration_rot = this.rotationTween(rotated_obj, angle, 0.5);
            let duration_pos = arenaDistance(obj, { x: x, y: y }) * 2;
            this.addAnimation(obj, { x: x, y: y }, duration_pos, ease ? "Quad.easeInOut" : "Linear");
            return Math.max(duration_rot, duration_pos);
        }

        /**
         * Make an object move toward a location in space, with a ship-like animation.
         * 
         * Returns the animation duration.
         */
        moveInSpace(obj: Phaser.GameObjects.Components.Transform, x: number, y: number, angle: number, rotated_obj = obj): number {
            if (x == obj.x && y == obj.y) {
                this.killPrevious(obj);
                return this.rotationTween(rotated_obj, angle, 0.5);
            } else {
                this.killPrevious(obj);
                this.killPrevious(rotated_obj);
                let distance = Target.newFromLocation(obj.x, obj.y).getDistanceTo(Target.newFromLocation(x, y));
                let duration = Math.sqrt(distance / 1000) * 3000;
                let curve_force = distance * 0.4;
                let prevx = obj.x;
                let prevy = obj.y;
                let xpts = [obj.x, obj.x + Math.cos(rotated_obj.rotation) * curve_force, x - Math.cos(angle) * curve_force, x];
                let ypts = [obj.y, obj.y + Math.sin(rotated_obj.rotation) * curve_force, y - Math.sin(angle) * curve_force, y];
                let fobj = { t: 0 };
                this.tweens.add({
                    targets: [fobj],
                    t: 1,
                    duration: duration,
                    ease: "Sine.easeInOut",
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
                return duration;
            }
        }
    }
}
