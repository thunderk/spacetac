module TK.SpaceTac.UI {
    /**
     * UI component to allow the user to enter a small text
     */
    export class UITextInput {
        private container: UIButton
        private content: UIText
        private placeholder: UIText
        private maxlength: number

        constructor(builder: UIBuilder, background: string, x = 0, y = 0, maxlength: number, placeholder = "") {
            this.container = builder.button(background, x, y, () => {
                builder.view.inputs.grabKeyboard(this, key => this.processKey(key));
            }, undefined, undefined, { center: true });

            this.content = builder.in(this.container).text("", 0, 0, { center: true });
            this.placeholder = builder.in(this.container).text(placeholder, 0, 0, { center: true });
            this.placeholder.setAlpha(0.5);
            this.maxlength = maxlength;
        }

        /**
         * Process a key press
         */
        processKey(key: string): void {
            if (key.length == 1 && this.content.text.length < this.maxlength) {
                this.setContent(this.content.text + key);
            } else if (key == "Backspace" && this.content.text.length > 0) {
                this.setContent(this.content.text.substr(0, this.content.text.length - 1));
            }
        }

        /**
         * Get current text content
         */
        getContent(): string {
            return this.content.text;
        }

        /**
         * Set the current text content
         */
        setContent(content: string): void {
            this.content.setText(content.slice(0, this.maxlength));
            this.placeholder.setVisible(!this.content.text);
        }
    }
}