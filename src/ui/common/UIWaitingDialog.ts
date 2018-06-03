module TK.SpaceTac.UI {
    /**
     * Dialog with a waiting indicator
     */
    export class UIWaitingDialog extends UIDialog {
        constructor(view: BaseView, message: string, cancel?: Function) {
            super(view);

            this.content.text(message, this.width * 0.5, this.height * 0.3, { color: "#90FEE3", size: 32 });
            this.content.awaiter(this.width * 0.5, this.height * 0.6);
        }

        /**
         * Display an error as the result of waiting.
         */
        displayError(message: string) {
            this.content.clear();
            this.content.text(message, this.width * 0.5, this.height * 0.5, { color: "#FE7069", size: 32 });
        }
    }
}