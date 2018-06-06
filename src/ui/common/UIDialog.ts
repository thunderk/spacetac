module TK.SpaceTac.UI {
    /**
     * Base class for modal dialogs
     * 
     * When a modal dialog opens, an overlay is displayed behind it to prevent clicking through it
     */
    export class UIDialog {
        readonly base: UIContainer
        readonly content: UIBuilder
        readonly width: number
        readonly height: number

        constructor(readonly view: BaseView, background_key = "common-dialog") {
            if (view.dialogs_opened.length == 0) {
                this.addOverlay(view.dialogs_layer);
            }

            let builder = new UIBuilder(view, view.dialogs_layer);
            this.base = builder.container("dialog-base");
            builder = builder.in(this.base);

            let background = builder.image(background_key);
            this.width = background.width;
            this.height = background.height;

            this.base.setPosition((this.view.getWidth() - this.width) / 2, (this.view.getHeight() - this.height) / 2);

            this.content = builder.in(builder.container("content"));

            add(view.dialogs_opened, this);

            view.audio.playOnce("ui-dialog-open");
        }

        /**
         * Add an input-capturing overlay
         */
        addOverlay(layer: UIContainer): void {
            new UIBuilder(this.view, layer).overlay({
                color: 0x888888,
                alpha: 0.3
            });
        }

        /**
         * Add a close button
         */
        addCloseButton(key = "common-dialog-close", x = 1290, y = 90): void {
            let builder = new UIBuilder(this.view, this.base);
            builder.button(key, x, y, () => this.close(), "Close this dialog");
        }

        /**
         * Close the dialog, removing the overlay if needed
         */
        close() {
            this.base.destroy();

            this.view.audio.playOnce("ui-dialog-close");

            remove(this.view.dialogs_opened, this);
            if (this.view.dialogs_opened.length == 0) {
                // Remove overlay
                this.view.dialogs_layer.removeAll(true);
            }
        }
    }
}
