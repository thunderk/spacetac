/// <reference path="../common/UIComponent.ts" />

module TK.SpaceTac.UI {
    /**
     * Base class for modal dialogs
     * 
     * When a modal dialog opens, an overlay is displayed behind it to prevent clicking through it
     */
    export class UIDialog extends UIComponent {
        constructor(parent: BaseView, width = 1495, height = 1080, background = "common-dialog") {
            super(parent, width, height, background);

            if (parent.dialogs_opened.length == 0) {
                this.addOverlay(parent.dialogs_layer);
            }
            add(parent.dialogs_opened, this);

            this.view.audio.playOnce("ui-dialog-open");

            this.moveToLayer(parent.dialogs_layer);
            this.setPositionInsideParent(0.5, 0.5);
        }

        /**
         * Add a control-capturing overlay
         */
        addOverlay(layer: Phaser.Group): void {
            let info = this.view.getImageInfo("translucent");
            let overlay = layer.game.add.button(0, 0, info.key, () => null, undefined, info.frame, info.frame);
            overlay.input.useHandCursor = false;
            overlay.scale.set(this.view.getWidth() / overlay.width, this.view.getHeight() / overlay.height);
            layer.add(overlay);
        }

        /**
         * Add a close button
         */
        addCloseButton(key = "common-dialog-close", x = 1290, y = 90): void {
            this.builder.button(key, x, y, () => this.close(), "Close this dialog");
        }

        /**
         * Close the dialog, removing the overlay if needed
         */
        close() {
            this.destroy();

            this.view.audio.playOnce("ui-dialog-close");

            remove(this.view.dialogs_opened, this);
            if (this.view.dialogs_opened.length == 0) {
                // Remove overlay
                this.view.dialogs_layer.removeAll(true);
            }
        }
    }
}
