module TK.SpaceTac.UI {
    /**
     * Decorated background for dynamic sized content (such as tooltips)
     */
    export class UIBackground {
        private graphics: UIGraphics
        x = 0
        y = 0
        width = 0
        height = 0

        constructor(readonly view: BaseView, readonly parent: UIContainer, readonly border = 6) {
            this.graphics = new UIBuilder(view, parent).graphics("background", 0, 0, false);
        }

        /**
         * Adapt the background to cover a given content
         */
        adaptToContent(content: UIContainer | UIText): void {
            if (content.parentContainer != this.graphics.parentContainer) {
                console.error("Content and background should have the same parent container");
                return;
            }

            let bounds = UITools.getBounds(content);

            let x = bounds.x - this.graphics.parentContainer.x - this.border;
            let y = bounds.y - this.graphics.parentContainer.y - this.border;
            let width = bounds.width + 2 * this.border;
            let height = bounds.height + 2 * this.border;

            if (x != this.x || y != this.y || width != this.width || height != this.height) {
                this.graphics.clear();
                this.graphics.lineStyle(2, 0x6690a4);
                this.graphics.fillStyle(0x162730);
                this.graphics.fillRect(x, y, width, height);
                this.graphics.strokeRect(x, y, width, height);
                this.graphics.setVisible(true);

                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
            }
        }

        /**
         * Remove the drawn background
         */
        clear(): void {
            this.graphics.setVisible(false);
            this.graphics.clear();
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
        }
    }
}
