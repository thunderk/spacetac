/// <reference path="UIComponent.ts" />

module TS.SpaceTac.UI {
    /**
     * UI component to display a text
     */
    export class UILabel extends UIComponent {
        private content: Phaser.Text

        constructor(parent: UIComponent, width: number, height: number, content = "", fontsize = 20, fontcolor = "#FFFFFF") {
            super(parent, width, height);

            this.content = new Phaser.Text(this.game, width / 2, height / 2, content, { align: "center", font: `${fontsize}px Arial`, fill: fontcolor })
            this.content.anchor.set(0.5, 0.5);
            this.addInternalChild(this.content);
        }

        /**
         * Set the label content
         */
        setContent(text: string): void {
            this.content.text = text;
        }
    }
}