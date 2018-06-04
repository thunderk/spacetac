module TK.SpaceTac.UI {
    /**
     * Dialog asking for a text input
     */
    export class UITextDialog extends UIDialog {
        private result: Promise<string | null>
        private result_resolver?: (input: string | null) => void

        constructor(view: BaseView, message: string, initial?: string) {
            super(view);

            this.content.text(message, this.width * 0.5, this.height * 0.3, { color: "#90FEE3", size: 32 });

            let input = new UITextInput(this.content.styled({ size: 24 }), "menu-input", this.width / 2, this.height / 2, 12);
            if (initial) {
                input.setContent(initial);
            }

            this.result = new Promise((resolve, reject) => {
                this.result_resolver = resolve;
                this.content.button("common-button-cancel", this.width * 0.4, this.height * 0.7, () => resolve(null),
                    undefined, undefined, { center: true });
                this.content.button("common-button-ok", this.width * 0.6, this.height * 0.7, () => resolve(input.getContent()),
                    undefined, undefined, { center: true });
            });
        }

        /**
         * Force the result (simulate filling the input and validation)
         */
        async forceResult(input: string | null): Promise<void> {
            if (this.result_resolver) {
                this.result_resolver(input);
                await this.result;
            }
        }

        /**
         * Convenient function to ask for an input, and have a promise of result
         */
        static ask(view: BaseView, message: string, initial?: string): Promise<string | null> {
            let dlg = new UITextDialog(view, message, initial);
            let result = dlg.result;
            return result.then(confirmed => {
                dlg.close();
                return confirmed;
            });
        }
    }
}