module TS.SpaceTac.UI {
    // Common UI tools functions
    export class Tools {
        /**
         * Reposition an object to remain inside a container
         */
        static keepInside(obj: Phaser.Button | Phaser.Sprite | Phaser.Image | Phaser.Group | Phaser.Graphics, rect: { x: number, y: number, width: number, height: number }) {
            let objbounds = obj.getBounds();

            if (obj.y + objbounds.height > rect.height) {
                obj.y = rect.height - objbounds.height;
            }
            if (obj.y < 0) {
                obj.y = 0;
            }

            if (obj.x + objbounds.width > rect.width) {
                obj.x = rect.width - objbounds.width;
            }
            if (obj.x < 0) {
                obj.x = 0;
            }
        }

        /**
         * Setup a hover/hold/click routine on an object
         * 
         * This should span the bridge between desktop and mobile targets.
         */
        static setHoverClick(obj: Phaser.Button, enter: Function, leave: Function, click: Function, hovertime = 300, holdtime = 600) {
            let holdstart = new Date();
            let enternext = null;
            let entercalled = false;
            let cursorinside = false;

            obj.input.useHandCursor = true;

            let prevententer = () => {
                if (enternext != null) {
                    Timer.global.cancel(enternext);
                    enternext = null;
                    return true;
                } else {
                    return false;
                }
            };

            let effectiveenter = () => {
                enternext = null;
                entercalled = true;
                enter();
            }

            let effectiveleave = () => {
                prevententer();
                if (entercalled) {
                    entercalled = false;
                    leave();
                }
            }

            if (obj.events) {
                obj.events.onDestroy.addOnce(() => {
                    prevententer();
                });
            }

            obj.onInputOver.add(() => {
                cursorinside = true;
                enternext = Timer.global.schedule(hovertime, effectiveenter);
            });

            obj.onInputOut.add(() => {
                cursorinside = false;
                effectiveleave();
            });

            obj.onInputDown.add(() => {
                holdstart = new Date();
                if (!cursorinside && !enternext) {
                    enternext = Timer.global.schedule(holdtime, effectiveenter);
                }
            });

            obj.onInputUp.add(() => {
                if (!cursorinside) {
                    effectiveleave();
                }

                if (new Date().getTime() - holdstart.getTime() < holdtime) {
                    if (!cursorinside) {
                        effectiveenter();
                    }
                    click();
                    if (!cursorinside) {
                        effectiveleave();
                    }
                }
            });
        }

        // Constraint an angle in radians the ]-pi;pi] range.
        static normalizeAngle(angle: number): number {
            angle = angle % (2 * Math.PI);
            if (angle <= -Math.PI) {
                return angle + 2 * Math.PI;
            } else if (angle > Math.PI) {
                return angle - 2 * Math.PI;
            } else {
                return angle;
            }
        }
    }
}
