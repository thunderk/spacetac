module TK.SpaceTac.UI {
    /**
     * Orientation of a ValueBar.
     * 
     * A EAST bar will have 0 at the west, and 1 at the east.
     */
    export enum ValueBarOrientation {
        NORTH,
        SOUTH,
        EAST,
        WEST,
    }

    /**
     * Bar to display a value with a graphical bar
     * 
     * This will crop the image according to the value
     */
    export class ValueBar {
        // Phaser node
        node: Phaser.Image

        // Orientation
        private orientation: ValueBarOrientation

        // Current value
        private current: number

        // Maximal value
        private maximal: number

        // Proportional value
        private proportional: number

        // Original size
        private original_width: number
        private original_height: number
        private crop_rect: Phaser.Rectangle

        constructor(view: BaseView, name: string, orientation: ValueBarOrientation, x = 0, y = 0) {
            this.node = view.newImage(name, x, y);
            this.orientation = orientation;
            this.original_width = this.node.width;
            this.original_height = this.node.height;

            this.crop_rect = new Phaser.Rectangle(0, 0, this.original_width, this.original_height);
            this.node.crop(this.crop_rect);

            if (orientation == ValueBarOrientation.WEST) {
                this.node.anchor.set(1, 0);
            } else if (orientation == ValueBarOrientation.NORTH) {
                this.node.anchor.set(0, 1);
            }

            this.setValue(0, 1000);
        }

        /**
         * Update the phaser graphics to match the value
         */
        update() {
            // TODO animation
            switch (this.orientation) {
                case ValueBarOrientation.EAST:
                    this.crop_rect.width = Math.round(this.original_width * this.proportional);
                    break;
                case ValueBarOrientation.WEST:
                    this.crop_rect.width = Math.round(this.original_width * this.proportional);
                    this.crop_rect.x = this.original_width - this.crop_rect.width;
                    break;
                case ValueBarOrientation.NORTH:
                    this.crop_rect.height = Math.round(this.original_height * this.proportional);
                    this.crop_rect.y = this.original_height - this.crop_rect.height;
                    break;
                case ValueBarOrientation.SOUTH:
                    this.crop_rect.height = Math.round(this.original_height * this.proportional);
                    break;
            }
            this.node.updateCrop();
        }

        /**
         * Set the current value, and maximal value
         */
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

        /**
         * Get current raw value
         */
        getValue(): number {
            return this.current;
        }

        /**
         * Get the proportional (in 0.0-1.0 range) value
         */
        getProportionalValue(): number {
            return this.proportional;
        }
    }
}
