module TK.SpaceTac.UI {
    /**
     * UI component to allow the user to enter a small text
     */
    export class UITextInput {
        private content: Phaser.Text
        private placeholder: Phaser.Text
        private maxlength: number

        constructor(builder: UIBuilder, background: string, x = 0, y = 0, maxlength: number, placeholder = "") {
            let input_bg = builder.image(background, x, y, true);
            input_bg.inputEnabled = true;
            input_bg.input.useHandCursor = true;
            input_bg.events.onInputUp.add(() => {
                builder.view.inputs.grabKeyboard(this, key => this.processKey(key));
            });

            this.content = builder.in(input_bg).text("");
            this.placeholder = builder.in(input_bg).text(placeholder);
            this.placeholder.alpha = 0.5;
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
            this.content.text = content.slice(0, this.maxlength);
            this.placeholder.visible = !this.content.text;
        }
    }
}