module TK.SpaceTac.UI {
    /**
     * Dialog asking for a confirmation
     */
    export class UIConfirmDialog extends UIDialog {
        private result: Promise<boolean>
        private result_resolver?: (confirmed: boolean) => void

        constructor(view: BaseView, message: string) {
            super(view);

            this.content.text(message, this.width * 0.5, this.height * 0.3, { color: "#90FEE3", size: 32 });

            this.result = new Promise((resolve, reject) => {
                this.result_resolver = resolve;
                this.content.button("common-button-cancel", this.width * 0.4, this.height * 0.6, () => resolve(false), undefined, undefined, { center: true });
                this.content.button("common-button-ok", this.width * 0.6, this.height * 0.6, () => resolve(true), undefined, undefined, { center: true });
            });
        }

        /**
         * Force the result (simulate clicking the appropriate button)
         */
        async forceResult(confirmed: boolean): Promise<void> {
            if (this.result_resolver) {
                this.result_resolver(confirmed);
                await this.result;
            }
        }

        /**
         * Convenient function to ask for a confirmation, and have a promise of result
         */
        static ask(view: BaseView, message: string): Promise<boolean> {
            let dlg = new UIConfirmDialog(view, message);
            let result = dlg.result;
            return result.then(confirmed => {
                dlg.close();
                return confirmed;
            });
        }
    }
}