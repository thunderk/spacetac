module TK.SpaceTac.UI {
    // A single displayed message
    class Message extends Phaser.Group {
        view: BaseView
        background: Phaser.Graphics
        text: Phaser.Text

        constructor(parent: Messages, text: string, duration: number) {
            super(parent.view.game);

            this.view = parent.view;

            this.background = new Phaser.Graphics(this.game);
            this.add(this.background);

            this.text = new Phaser.Text(this.game, 0, 0, text,
                { font: "bold 14pt SpaceTac", fill: "#90FEE3" });
            this.add(this.text);

            this.position.set(parent.view.getWidth(), 10);

            parent.view.timer.schedule(duration, () => this.hide());
        }

        // Hide the message
        hide() {
            var tween = this.game.tweens.create(this);
            tween.to({ y: this.y + 50, alpha: 0 }, 400, Phaser.Easing.Circular.In);
            tween.onComplete.addOnce(() => {
                this.destroy();
            });
            tween.start();
        }

        update() {
            UITools.drawBackground(this.text, this.background, 6);

            this.x = this.view.getWidth() - this.width - 10;
        }
    }

    // Visual notifications of game-related messages (eg. "Game saved"...)
    export class Messages {
        // Link to parent view
        view: BaseView;

        // Main group to hold the visual messages
        container: Phaser.Group;

        constructor(parent: BaseView) {
            this.view = parent;

            this.container = new Phaser.Group(parent.game);
            parent.add.existing(this.container);
        }

        // Add a new message to the notifications
        addMessage(text: string, duration: number = 3000): void {
            this.container.forEachExists((child: Message) => {
                child.y += child.height + 5;
            }, this);

            var message = new Message(this, text, duration);
            this.container.addChild(message);
        }
    }
}
