module TS.SpaceTac.View {
    // Common UI tools functions
    export class Tools {

        /**
         * Setup a hover/hold/click routine on an object
         * 
         * This should span the bridge between desktop and mobile targets.
         */
        static setHoverClick(obj: Phaser.Button, enter: Function, leave: Function, click: Function, hovertime = 300, holdtime = 600) {
            let holdstart = new Date();
            let enternext = null;
            let hovered = false;

            obj.input.useHandCursor = true;

            let prevententer = () => {
                if (enternext != null) {
                    clearTimeout(enternext);
                    enternext = null;
                }
            };

            obj.onInputOver.add(() => {
                enternext = setTimeout(enter, hovertime);
                hovered = true;
            });

            obj.onInputOut.add(() => {
                prevententer();
                leave();
                hovered = false;
            });

            obj.onInputDown.add(() => {
                holdstart = new Date();
                enternext = setTimeout(enter, holdtime);
            });

            obj.onInputUp.add(() => {
                prevententer();
                if (new Date().getTime() - holdstart.getTime() < holdtime) {
                    if (!hovered) {
                        enter();
                    }
                    click();
                    if (!hovered) {
                        leave();
                    }
                } else if (!hovered) {
                    leave();
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

        // Interpolate a rotation value
        //  This will take into account the 2*pi modulo
        static rotationTween(tween: Phaser.Tween, dest: number, property: string = "rotation"): void {
            // Immediately change the object's current rotation to be in range (-pi,pi)
            var value = Tools.normalizeAngle(tween.target[property]);
            tween.target[property] = value;

            // Update the tween
            dest = Tools.normalizeAngle(dest);
            if (value - dest > Math.PI) {
                dest += 2 * Math.PI;
            } else if (value - dest < -Math.PI) {
                dest -= 2 * Math.PI;
            }
            var changes: Object = {};
            changes[property] = dest;
            tween.to(changes);
        }
    }
}
