module TS.SpaceTac.UI {
    // A single displayed message
    class Message extends Phaser.Group {
        text: Phaser.Text;

        constructor(parent: Messages, text: string, duration: number) {
            super(parent.container.game);

            this.text = new Phaser.Text(this.game, 0, 0, text,
                { font: "bold 14px Arial", fill: "#90FEE3" });
            this.addChild(this.text);

            parent.parent.timer.schedule(duration, () => this.hide());
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
    }

    // Visual notifications of game-related messages (eg. "Game saved"...)
    export class Messages {
        // Link to parent view
        parent: BaseView;

        // Main group to hold the visual messages
        container: Phaser.Group;

        constructor(parent: BaseView) {
            this.parent = parent;

            this.container = new Phaser.Group(parent.game);
            parent.add.existing(this.container);
        }

        // Add a new message to the notifications
        addMessage(text: string, duration: number = 5000): void {
            this.container.forEachExists((child: Message) => {
                child.y += 30;
            }, this);

            var message = new Message(this, text, duration);
            this.container.addChild(message);

            this.parent.world.bringToTop(this.container);
        }
    }
}
