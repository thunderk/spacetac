module TS.SpaceTac.UI {
    // Manager for keyboard input / bindings
    //  Action callbacks will receive the view as 'this' context
    export class InputManager {

        private view: BaseView;

        private game: MainUI;

        private input: Phaser.Input;

        private cheats_enabled: boolean;

        private cheat: boolean;

        constructor(view: BaseView) {
            this.view = view;
            this.game = view.gameui;
            this.input = view.input;
            this.cheats_enabled = true;
            this.cheat = false;

            // Default mappings
            this.bind(Phaser.Keyboard.S, "Quick save", () => {
                this.game.saveGame();
            });
            this.bind(Phaser.Keyboard.L, "Quick load", () => {
                this.game.loadGame();
                this.game.state.start("router");
            });
            this.bind(Phaser.Keyboard.M, "Toggle sound", () => {
                this.game.audio.toggleMute();
            });
            this.bind(Phaser.Keyboard.NUMPAD_ADD, null, () => {
                if (this.cheats_enabled) {
                    this.cheat = !this.cheat;
                }
            });
        }

        // Bind a key to an action
        bind(key: number, desc: string, action: Function): void {
            this.input.keyboard.addKey(key).onUp.add(action, this.view);
        }

        // Bind a key to a cheat action
        bindCheat(key: number, desc: string, action: Function): void {
            this.bind(key, null, () => {
                if (this.cheat) {
                    console.warn("Cheat ! " + desc);
                    action();
                }
            });
        }
    }
}
