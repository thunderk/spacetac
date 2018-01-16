/// <reference path="UIComponent.ts" />

module TK.SpaceTac.UI {
    export type UIConversationPiece = { interlocutor: Ship, message: string }
    export type UIConversationCallback = (conversation: UIConversation, step: number) => boolean

    /**
     * Style for a conversational message display
     */
    export class UIConversationStyle {
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
     * Rectangle to display a message that may appear progressively, as in conversations
     */
    export class UIConversationMessage extends UIComponent {
        constructor(parent: BaseView | UIComponent, width: number, height: number, message: string, style = new UIConversationStyle()) {
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

    /**
     * Display of an active conversation (sequence of messages)
     */
    export class UIConversation extends UIComponent {
        private step = -1
        private on_step: UIConversationCallback
        private ended = false
        private on_end = new Phaser.Signal()

        constructor(parent: BaseView, on_step: UIConversationCallback) {
            super(parent, parent.getWidth(), parent.getHeight());

            this.drawBackground(0x404450, undefined, undefined, 0.7, () => this.forward());
            this.setVisible(false);

            this.on_step = on_step;

            this.forward();
        }

        destroy() {
            if (!this.ended) {
                this.ended = true;
                this.on_end.dispatch();
            }

            super.destroy();
        }

        /**
         * Promise to wait for the end of conversation
         */
        waitEnd(): Promise<void> {
            if (this.ended) {
                return Promise.resolve();
            } else {
                return new Promise((resolve, reject) => {
                    this.on_end.addOnce(resolve);
                });
            }
        }

        /**
         * Set the currently displayed message
         */
        setCurrentMessage(style: UIConversationStyle, content: string, width: number, height: number, relx: number, rely: number): void {
            this.clearContent();

            let message = new UIConversationMessage(this, width, height, content, style);
            message.addButton(width - 60, height - 60, () => this.forward(), "common-arrow");
            message.setPositionInsideParent(relx, rely);

            this.setVisible(true, 700);
        }

        /**
         * Convenience to set the current message from a ship
         * 
         * This will automatically set the style and position of the message
         */
        setCurrentShipMessage(ship: Ship, content: string): void {
            let style = new UIConversationStyle();
            style.image = `ship-${ship.model.code}-portrait`;
            style.image_caption = ship.getName(false);
            style.image_size = 256;

            let own = this.view.gameui.session.player.is(ship.fleet.player);
            this.setCurrentMessage(style, content, 900, 300, own ? 0.1 : 0.9, own ? 0.2 : 0.8);
        }

        /**
         * Go forward to the next message
         */
        forward(): void {
            this.step += 1;
            if (!this.on_step(this, this.step)) {
                this.destroy();
            }
        }

        /**
         * Convenience to create a conversation from a list of pieces
         */
        static newFromPieces(view: BaseView, pieces: UIConversationPiece[]): UIConversation {
            let result = new UIConversation(view, (conversation, step) => {
                if (step >= pieces.length) {
                    return false;
                } else {
                    conversation.setCurrentShipMessage(pieces[step].interlocutor, pieces[step].message);
                    return true;
                }
            });
            return result;
        }
    }
}