module TS.SpaceTac.UI {
    /**
     * Style for a message display
     */
    export class ProgressiveMessageStyle {
        // Center the message or not
        center = false

        // Padding between the content and the external border
        padding = 10

        // Background fill color
        background = 0x202225
        alpha = 0.9

        // Border color and width
        border = 0x404450
        border_width = 2

        // Text font style
        text_color = "#ffffff"
        text_size = 20
        text_bold = true

        // Portrait or image to display (from atlases)
        image = ""
        image_size = 0
        image_caption = ""
    }

    /**
     * Rectangle to display a message that may appear progressively, as in dialogs
     */
    export class ProgressiveMessage extends UIComponent {
        constructor(parent: BaseView | UIComponent, width: number, height: number, message: string, style = new ProgressiveMessageStyle()) {
            super(parent, width, height);

            this.drawBackground(style.background, style.border, style.border_width, style.alpha);

            let offset = 0;
            if (style.image_size && style.image) {
                offset = style.image_size + style.padding;
                width -= offset;

                let ioffset = style.padding + Math.floor(style.image_size / 2);
                this.addImage(ioffset, ioffset, style.image);

                if (style.image_caption) {
                    let text_size = Math.ceil(style.text_size * 0.6);
                    this.addText(ioffset, style.padding + style.image_size + text_size, style.image_caption,
                        style.text_color, text_size, false, true, style.image_size);
                }
            }

            let text = this.addText(offset + (style.center ? width / 2 : style.padding), style.center ? height / 2 : style.padding, message,
                style.text_color, style.text_size, style.text_bold, style.center, width - style.padding * 2, style.center);

            let i = 0;
            let colorchar = () => {
                text.clearColors();
                if (i < message.length) {
                    text.addColor("transparent", i);
                    i++;
                    this.view.timer.schedule(10, colorchar);
                }
            }
            colorchar();
        }
    }
}