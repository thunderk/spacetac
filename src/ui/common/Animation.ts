module TS.SpaceTac.UI {
    /**
     * Utility functions for animation
     */
    export class Animation {

        // Display an object, fading in using opacity
        static fadeIn(game: Phaser.Game, obj: PIXI.DisplayObject, duration: number = 1000, alpha: number = 1): void {
            if (!obj.visible) {
                obj.alpha = 0;
                obj.visible = true;
            }
            var tween = game.tweens.create(obj);
            tween.to({ alpha: alpha }, duration);
            tween.start();
        }

        // Hide an object, fading out using opacity
        static fadeOut(game: Phaser.Game, obj: PIXI.DisplayObject, duration: number = 1000): void {
            var tween = game.tweens.create(obj);
            tween.to({ alpha: 0 }, duration);
            tween.start();
        }

        // Set visibility of an object, using either fadeIn or fadeOut
        static setVisibility(game: Phaser.Game, obj: PIXI.DisplayObject, visible: boolean, duration: number = 1000): void {
            if (visible) {
                Animation.fadeIn(game, obj, duration);
            } else {
                Animation.fadeOut(game, obj, duration);
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
    }
}
