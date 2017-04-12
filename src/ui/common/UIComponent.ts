module TS.SpaceTac.UI {
    /**
     * Base class for UI components
     */
    export class UIComponent {
        private view: BaseView;
        private parent: UIComponent | null;
        private container: Phaser.Group;
        private width: number;
        private height: number;

        constructor(parent: BaseView | UIComponent, width: number, height: number) {
            if (parent instanceof UIComponent) {
                this.view = parent.view;
                this.parent = parent;
            } else {
                this.view = parent;
                this.parent = null;
            }

            this.container = this.view.add.group();

            this.width = width;
            this.height = height;
        }

        /**
         * Set the component's visibility, with optional transition (in milliseconds)
         */
        setVisible(visible: boolean, transition = 0): void {
            if (transition > 0) {
                this.view.animations.setVisible(this.container, visible, transition);
            } else {
                this.container.visible = visible;
            }
        }

        /**
         * Get the component's declared size
         */
        getSize(): [number, number] {
            return [this.width, this.height];
        }

        /**
         * Get the width and height of parent
         */
        getParentSize(): [number, number] {
            if (this.parent) {
                return this.parent.getSize();
            } else {
                return [this.view.getWidth(), this.view.getHeight()];
            }
        }

        /**
         * Return the component's position (either relative to its parent, or absolute in the view)
         */
        getPosition(relative = false): [number, number] {
            if (relative || !this.parent) {
                return [this.container.x, this.container.y];
            } else {
                let [px, py] = this.parent.getPosition();
                return [px + this.container.x, py + this.container.y];
            }
        }

        /**
         * Position the component inside the boundaries of its parent.
         * 
         * (0, 0) is the top-left anchoring, (1, 1) is the bottom-right one.
         * 
         * If *pixelsnap* is true, position will be rounded to pixel.
         */
        setPositionInsideParent(x: number, y: number, pixelsnap = true): void {
            let [pwidth, pheight] = this.getParentSize();
            let [width, height] = this.getSize();
            let rx = (pwidth - width) * x;
            let ry = (pheight - height) * y;
            if (pixelsnap) {
                this.container.position.set(Math.round(rx), Math.round(ry));
            } else {
                this.container.position.set(rx, ry);
            }
        }
    }
}
