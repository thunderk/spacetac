module SpaceTac.View {
    "use strict";

    // Base class for all game views
    export class BaseView extends Phaser.State {
        // Link to the root UI
        protected gameui: GameUI;

        // Init the view
        init(...args: any[]) {
            this.gameui = <GameUI>this.game;
        }

        // Create view graphics
        create() {
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
        }
    }
}
