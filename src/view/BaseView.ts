module SpaceTac.View {
    "use strict";

    // Base class for all game views
    export class BaseView extends Phaser.State {
        // Link to the root UI
        gameui: GameUI;

        // Message notifications
        messages: Messages;

        // Input and key bindings
        inputs: InputManager;

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

            // Input manager
            this.inputs = new InputManager(this);
        }
    }
}
