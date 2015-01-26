module SpaceTac.View {
    "use strict";

    // Common UI tools functions
    export class Tools {

        // Constraint an angle in radians the ]-pi;pi] range.
        static normalizeAngle(angle: number): number {
            angle = angle % (2 * Math.PI);
            if (angle <= -Math.PI) {
                return angle + 2 * Math.PI;
            } else if (angle >  Math.PI) {
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
            console.log(value, dest);
            var changes: Object = {};
            changes[property] = dest;
            tween.to(changes);
        }
    }
}
