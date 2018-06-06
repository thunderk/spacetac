module TK.SpaceTac.UI {
    export interface UIOverlayOptions {
        color: number,
        alpha?: number,
        on_click?: Function
    }

    /**
     * UI component to display a semi-transparent overlay that fills the whole view and captures inputs
     */
    export class UIOverlay extends UIGraphics {
        constructor(view: BaseView, options: UIOverlayOptions) {
            super(view, "overlay");

            let rect = { x: 0, y: 0, width: view.getWidth(), height: view.getHeight() };
            this.addRectangle(rect, options.color, undefined, undefined, options.alpha);
            this.setInteractive(rect, (rect: Phaser.Geom.Rectangle, x: number, y: number) => Phaser.Geom.Rectangle.Contains(rect, x, y) && UITools.isVisible(this));
            this.on("pointerup", options.on_click || nop);
        }
    }
}
