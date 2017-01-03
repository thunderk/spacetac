module SpaceTac.View {
    // Utility functions for animation
    export class Animation {

        // Display an object, fading in using opacity
        static fadeIn(game: Phaser.Game, obj: PIXI.DisplayObject, duration: number = 1000): void {
            if (!obj.visible) {
                obj.alpha = 0;
                obj.visible = true;
            }
            var tween = game.tweens.create(obj);
            tween.to({alpha: 1}, duration);
            tween.start();
        }

        // Hide an object, fading out using opacity
        static fadeOut(game: Phaser.Game, obj: PIXI.DisplayObject, duration: number = 1000): void {
            var tween = game.tweens.create(obj);
            tween.to({alpha: 0}, duration);
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
    }
}
