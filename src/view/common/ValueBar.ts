module SpaceTac.View {
    // Bar to display a value (like a progress bar)
    export class ValueBar extends Phaser.Sprite {
        // Vertical orientation
        vertical: boolean;

        // Current value
        private current: number;

        // Maximal value
        private maximal: number;

        // Proportional value
        private proportional: number;

        // Sprite of internal bar (inside the background sprite)
        private bar_sprite: Phaser.Sprite;
        private bar_sprite_rect: Phaser.Rectangle;
        private bar_sprite_offset: number;

        // Create a quick standard bar
        static newStandard(game: Phaser.Game, x: number, y: number): ValueBar {
            var result = new ValueBar(game, x, y, "common-standard-bar-background");
            result.setBarImage("common-standard-bar-foreground", 5, 5);
            return result;
        }

        // Create a quick styled bar
        static newStyled(game: Phaser.Game, base_key: string, x: number, y: number, vertical: boolean = false): ValueBar {
            var result = new ValueBar(game, x, y, base_key + "-empty", vertical);
            result.setBarImage(base_key + "-full");
            return result;
        }

        // Build an value bar sprite
        //  background is the key to the image to use as background
        constructor(game: Phaser.Game, x: number, y: number, background: string, vertical: boolean = false) {
            super(game, x, y, background);

            this.vertical = vertical;

            this.setValue(0, 1000);
        }

        // Set an image to use for the bar
        setBarImage(key: string, offset_x: number = 0, offset_y: number = 0): void {
            this.bar_sprite = new Phaser.Sprite(this.game, offset_x, offset_y, key);
            this.bar_sprite_rect = new Phaser.Rectangle(0, 0, this.bar_sprite.width, this.bar_sprite.height);
            this.bar_sprite_offset = this.vertical ? offset_y : offset_x;
            this.addChild(this.bar_sprite);
        }

        // Update graphics representation
        update() {
            if (this.bar_sprite) {
                var xdest = this.vertical ? 1.0 : this.proportional;
                var ydest = this.vertical ? this.proportional : 1.0;

                // TODO Animate
                var rect = Phaser.Rectangle.clone(this.bar_sprite_rect);
                rect = rect.scale(xdest, ydest);
                if (this.vertical) {
                    rect = rect.offset(0, this.bar_sprite_rect.height - rect.height);
                }
                this.bar_sprite.crop(rect, false);
                if (this.vertical) {
                    this.bar_sprite.y = this.bar_sprite_offset + (this.bar_sprite_rect.height - rect.height);
                }
            }
        }

        // Set current value
        setValue(current: number, maximal: number = -1) {
            this.current = current > 0 ? current : 0;
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
