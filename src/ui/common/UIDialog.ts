/// <reference path="../common/UIComponent.ts" />

module TS.SpaceTac.UI {
    /**
     * Base class for modal dialogs
     * 
     * When a modal dialog opens, an overlay is displayed behind it to prevent clicking through it
     */
    export class UIDialog extends UIComponent {
        constructor(parent: BaseView, width: number, height: number, background: string) {
            super(parent, width, height, background);

            if (parent.dialogs_layer.children.length == 0) {
                this.addOverlay(parent.dialogs_layer);
            }

            this.moveToLayer(parent.dialogs_layer);
            this.setPositionInsideParent(0.5, 0.5);
        }

        /**
         * Add a control-capturing overlay
         */
        addOverlay(layer: Phaser.Group): void {
            let overlay = layer.game.add.button(0, 0, "common-transparent", () => null);
            overlay.scale.set(this.view.getWidth() / overlay.width, this.view.getHeight() / overlay.height);
            layer.add(overlay);
        }

        /**
         * Add a close button
         */
        addCloseButton(key: string, x: number, y: number, frame = 0, frame_hover = 1): void {
            this.addButton(x, y, () => this.close(), key, frame, frame_hover, "Close this dialog");
        }

        /**
         * Close the dialog, removing the overlay if needed
         */
        close() {
            this.destroy();

            if (this.view.dialogs_layer.children.length == 1) {
                this.view.dialogs_layer.removeAll(true);
            }
        }
    }
}
