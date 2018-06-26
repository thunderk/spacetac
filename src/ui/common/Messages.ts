module TK.SpaceTac.UI {
    /**
     * A single displayed message
     */
    class Message extends UIContainer {
        view: BaseView
        background: UIBackground
        text: UIText

        constructor(parent: Messages, text: string, duration: number) {
            super(parent.view);

            this.view = parent.view;
            let builder = new UIBuilder(this.view).in(this);

            this.background = new UIBackground(this.view, this);

            this.text = builder.text(text, 0, 0, { color: "#DBEFF9", shadow: true, size: 16, center: false, vcenter: false });

            UITools.drawBackground(this.text, this.background, 6);

            let bounds = UITools.getBounds(this);
            this.setPosition(parent.view.getX(1) - bounds.width - 25, 25);
            parent.view.timer.schedule(duration, () => this.hide());
        }

        /**
         * Hide the message
         */
        hide() {
            this.view.animations.addAnimation<UIContainer>(this, { y: this.y + 50, alpha: 0 }, 400, "Circ.easeIn").then(() => this.destroy());
        }
    }

    /**
     * Visual notifications of game-related messages (eg. "Game saved"...)
     */
    export class Messages {
        // Link to parent view
        view: BaseView

        // Main group to hold the visual messages
        container: UIContainer

        constructor(view: BaseView) {
            this.view = view;
            this.container = new UIBuilder(view, view.messages_layer).container("messages");
        }

        /**
         * Add a new message to the notifications
         */
        addMessage(text: string, duration: number = 3000): void {
            let message = new Message(this, text, duration);
            let bounds = UITools.getBounds(message);
            cfilter(this.container.list, Message).forEach(child => {
                child.y += bounds.height + 15;
            });
            this.container.add(message);
        }
    }
}
