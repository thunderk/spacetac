module SpaceTac.View {
    "use strict";

    // Base class for all game views
    export class BaseView extends Phaser.State {
        // Link to the root UI
        gameui: GameUI;

        // Message notifications
        messages: Messages;

        // Get the size of display
        getWidth(): number {
            return this.game.width || 1280;
        }
        getHeight(): number {
            return this.game.height || 720;
        }
        getMidWidth(): number {
            return this.getWidth() / 2;
        }
        getMidHeight(): number {
            return this.getHeight() / 2;
        }

        // Init the view
        init(...args: any[]) {
            this.gameui = <GameUI>this.game;
        }

        // Create view graphics
        create() {
            // Notifications
            this.messages = new Messages(this);

            // Key mapping
            var key_s = this.input.keyboard.addKey(Phaser.Keyboard.S);
            key_s.onUp.add(() => {
                this.gameui.saveGame();
            });
            var key_l = this.input.keyboard.addKey(Phaser.Keyboard.L);
            key_l.onUp.add(() => {
                this.gameui.loadGame();
                this.game.state.start("router");
            });
            var key_m = this.input.keyboard.addKey(Phaser.Keyboard.M);
            key_m.onUp.add(() => {
                this.gameui.audio.toggleMute();
            });
        }
    }
}
