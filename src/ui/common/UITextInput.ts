/// <reference path="UIComponent.ts" />

module TS.SpaceTac.UI {
    /**
     * UI component to allow the user to enter a small text
     */
    export class UITextInput extends UIComponent {
        private content: Phaser.Text
        private maxlength: number

        constructor(parent: UIComponent, width: number, height: number, maxlength?: number, fontcolor = "#FFFFFF") {
            super(parent, width, height);

            let input_bg = new Phaser.Image(this.game, 0, 0, "common-transparent");
            input_bg.scale.set(width, height);
            input_bg.inputEnabled = true;
            input_bg.input.useHandCursor = true;
            input_bg.events.onInputUp.add(() => this.setKeyboardFocus(key => this.processKey(key)));
            this.addInternalChild(input_bg);

            let fontsize = Math.ceil(height * 0.8);
            this.content = new Phaser.Text(this.game, width / 2, height / 2, "", { align: "center", font: `${fontsize}px Arial`, fill: fontcolor });
            this.content.anchor.set(0.5, 0.5);
            this.addInternalChild(this.content);

            this.maxlength = maxlength || (width / fontsize);
        }

        /**
         * Process a key press
         */
        processKey(key: string): void {
            if (key.length == 1 && this.content.text.length < this.maxlength) {
                this.content.text += key;
            } else if (key == "Backspace" && this.content.text.length > 0) {
                this.content.text = this.content.text.substr(0, this.content.text.length - 1);
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
        }
    }
}