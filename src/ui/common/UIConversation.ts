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
        background = 0x1B3B4B
        alpha = 0.9

        // Border color and width
        border = 0x3A6479
        border_width = 2

        // Text style
        text: UITextStyleI = {
            color: "#DBEFF9",
            size: 20,
            bold: true,
            shadow: true
        }

        // Portrait or image to display (from atlases)
        image = ""
        image_size = 0
        image_caption = ""
    }

    /**
     * Rectangle to display a message that may appear progressively, as in conversations
     */
    export class UIConversationMessage {
        private container: UIContainer

        constructor(private builder: UIBuilder, private width: number, private height: number, message: string, style = new UIConversationStyle(), forward?: Function) {
            this.container = builder.container("conversation-message");

            builder.styled(style.text).in(this.container, builder => {
                if (!style.center) {
                    builder = builder.styled({ center: false, vcenter: false });
                }

                builder.graphics("background").addRectangle({ x: 0, y: 0, width: width, height: height },
                    style.background, style.border_width, style.border, style.alpha);

                let offset = 0;
                if (style.image_size && style.image) {
                    offset = style.image_size + style.padding;
                    width -= offset;

                    let ioffset = style.padding + Math.floor(style.image_size / 2);
                    builder.image(style.image, ioffset, ioffset, true);

                    if (style.image_caption) {
                        let text_size = Math.ceil(style.text.size ? style.text.size * 0.6 : 16);
                        builder.text(style.image_caption, ioffset, style.padding + style.image_size + text_size, {
                            size: text_size,
                            center: true
                        });
                    }
                }

                let text = builder.text(message, offset + (style.center ? width / 2 : style.padding), style.center ? height / 2 : style.padding, {
                    width: width - style.padding * 2
                });

                /*let i = 0;
                let colorchar = () => {
                    text.clearColors();
                    if (i < message.length) {
                        text.addColor("transparent", i);
                        i++;
                        this.view.timer.schedule(10, colorchar);
                    }
                }
                colorchar();*/

                if (forward) {
                    builder.button("common-arrow", this.width - 30, this.height - 30, forward, "Next", undefined, { center: true });
                }
            });
        }

        destroy() {
            this.container.destroy();
        }

        positionRelative(relx: number, rely: number) {
            let view = this.builder.view;
            let rx = (view.getWidth() - this.width) * relx;
            let ry = (view.getHeight() - this.height) * rely;
            this.container.setPosition(Math.round(rx), Math.round(ry));
        }

        setVisible(visible: boolean, duration = 0): void {
            this.container.setVisible(visible, duration);
        }
    }

    /**
     * Display of an active conversation (sequence of messages)
     */
    export class UIConversation {
        private view: BaseView
        private builder: UIBuilder
        private container: UIContainer
        private overlay: UIOverlay
        private message?: UIConversationMessage
        private step = -1
        private on_step: UIConversationCallback
        private ended = false
        private on_end = new Phaser.Events.EventEmitter()

        constructor(builder: UIBuilder, on_step: UIConversationCallback) {
            this.view = builder.view;

            this.container = builder.container("conversation");
            this.builder = builder.in(this.container);
            this.overlay = this.builder.overlay({
                color: 0x404450,
                alpha: 0.7,
                on_click: () => this.forward()
            });
            this.setVisible(false);

            this.on_step = on_step;

            this.forward();
        }

        /**
         * Clear the content of previous message, if any
         */
        clearContent(): void {
            if (this.message) {
                this.message.destroy();
                this.message = undefined;
            }
        }

        /**
         * Set the global visibility
         */
        setVisible(visible: boolean, duration = 0): void {
            this.container.setVisible(visible, duration);
        }

        /**
         * Destroy the conversation handler
         */
        destroy() {
            if (!this.ended) {
                this.ended = true;
                this.on_end.emit("done");
            }

            this.container.destroy();
        }

        /**
         * Promise to wait for the end of conversation
         */
        waitEnd(): Promise<void> {
            if (this.ended) {
                return Promise.resolve();
            } else {
                return new Promise(resolve => {
                    this.on_end.on("done", resolve);
                });
            }
        }

        /**
         * Set the currently displayed message
         */
        setCurrentMessage(style: UIConversationStyle, content: string, width: number, height: number, relx: number, rely: number): void {
            this.clearContent();

            this.message = new UIConversationMessage(this.builder, width, height, content, style, () => this.forward());
            this.message.positionRelative(relx, rely);

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
            this.setCurrentMessage(style, content, 900, 310, own ? 0.1 : 0.9, own ? 0.2 : 0.8);
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
        static newFromPieces(builder: UIBuilder, pieces: UIConversationPiece[]): UIConversation {
            let result = new UIConversation(builder, (conversation, step) => {
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