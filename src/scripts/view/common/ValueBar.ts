module SpaceTac.View {
    "use strict";

    // Bar to display a value (like a progress bar)
    export class ValueBar extends Phaser.Sprite {
        // Current value
        private current: number;

        // Maximal value
        private maximal: number;

        // Proportional value
        private proportional: number;

        // Sprite of internal bar (inside the background sprite)
        private bar_sprite: Phaser.Sprite;

        // Create a quick standard bar
        static newStandard(game: Phaser.Game, x: number, y: number): ValueBar {
            var result = new ValueBar(game, x, y, "ui-bar-standard-background");
            result.setBarImage("ui-bar-standard-foreground", 5, 5);
            return result;
        }

        // Build an value bar sprite
        //  background is the key to the image to use as background
        constructor(game: Phaser.Game, x: number, y: number, background: string) {
            super(game, x, y, background);

            this.setValue(0, 1000);
        }

        // Set an image to use for the bar
        setBarImage(key: string, offset_x: number = 0, offset_y: number = 0): void {
            this.bar_sprite = new Phaser.Sprite(this.game, offset_x, offset_y, key);
            this.addChild(this.bar_sprite);
        }

        // Update graphics representation
        update() {
            if (this.bar_sprite) {
                var tween = this.game.tweens.create(this.bar_sprite.scale);
                tween.to({x: this.proportional});
                tween.start();
            }
        }

        // Set current value
        setValue(current: number, maximal: number = -1) {
            this.current = current;
            if (maximal >= 0) {
                this.maximal = maximal;
            }
            if (this.maximal === 0) {
                this.proportional = 0;
            } else {
                this.proportional = this.current / this.maximal;
            }

            this.update();
        }

        // Get the proportional (in 0.0-1.0 range) value
        getProportionalValue(): number {
            return this.proportional;
        }
    }
}
