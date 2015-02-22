module SpaceTac.View {
    "use strict";

    // Display mode for ValueBar
    export enum ValueBarMode {
        Scaled,
        Truncated
    }

    // Bar to display a value (like a progress bar)
    export class ValueBar extends Phaser.Sprite {
        // Display mode, true to scale the internal bar, false to truncate it
        display_mode: ValueBarMode;

        // Current value
        private current: number;

        // Maximal value
        private maximal: number;

        // Proportional value
        private proportional: number;

        // Sprite of internal bar (inside the background sprite)
        private bar_sprite: Phaser.Sprite;
        private bar_sprite_rect: Phaser.Rectangle;

        // Create a quick standard bar
        static newStandard(game: Phaser.Game, x: number, y: number): ValueBar {
            var result = new ValueBar(game, x, y, "common-standard-bar-background");
            result.setBarImage("common-standard-bar-foreground", 5, 5);
            return result;
        }

        // Build an value bar sprite
        //  background is the key to the image to use as background
        constructor(game: Phaser.Game, x: number, y: number, background: string,
                    display_mode: ValueBarMode = ValueBarMode.Truncated) {
            super(game, x, y, background);

            this.display_mode = display_mode;

            this.setValue(0, 1000);
        }

        // Set an image to use for the bar
        setBarImage(key: string, offset_x: number = 0, offset_y: number = 0): void {
            this.bar_sprite = new Phaser.Sprite(this.game, offset_x, offset_y, key);
            this.bar_sprite_rect = new Phaser.Rectangle(0, 0, this.bar_sprite.width, this.bar_sprite.height);
            this.addChild(this.bar_sprite);
        }

        // Update graphics representation
        update() {
            if (this.bar_sprite) {
                var dest = this.proportional;
                if (dest < 0.00001) {
                    dest = 0.00001;
                }

                if (this.display_mode === ValueBarMode.Scaled) {
                    this.game.tweens.create(this.bar_sprite.scale).to({x: dest}).start();
                } else {
                    // TODO Animate
                    this.bar_sprite.crop(Phaser.Rectangle.clone(this.bar_sprite_rect).scale(dest, 1.0), false);
                }
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
