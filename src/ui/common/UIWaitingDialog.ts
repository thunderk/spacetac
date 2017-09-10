module TS.SpaceTac.UI {
    /**
     * Dialog with a waiting indicator
     */
    export class UIWaitingDialog extends UIDialog {
        constructor(view: BaseView, message: string, cancel?: Function) {
            super(view);

            this.addText(this.width * 0.5, this.height * 0.3, message, "#90FEE3", 32);
            this.addLoader(this.width * 0.5, this.height * 0.6);
        }

        /**
         * Display an error as the result of waiting.
         */
        displayError(message: string) {
            this.clearContent();
            this.addText(this.width * 0.5, this.height * 0.5, message, "#FE7069", 32);
            this.addCloseButton();
        }
    }
}