module TK.SpaceTac.UI {
    /**
     * UI component that supports drawing simple shapes (circles, lines...)
     */
    export class UIGraphics extends Phaser.GameObjects.Graphics {
        constructor(view: BaseView, name: string, visible = true, x = 0, y = 0) {
            super(view, {});
            this.setName(name);
            this.setVisible(visible);
            this.setPosition(x, y);
        }

        /**
         * Add a rectangle
         */
        addRectangle(shape: IBounded, color: number, border_width = 0, border_color?: number, alpha = 1): void {
            let rect = new Phaser.Geom.Rectangle(shape.x, shape.y, shape.width, shape.height);

            this.fillStyle(color, alpha);
            this.fillRectShape(rect);
            if (border_width && border_color) {
                this.lineStyle(border_width, border_color, alpha);
                this.strokeRectShape(rect);
            }
        }
    }
}
