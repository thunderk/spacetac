module TS.SpaceTac.UI {
    type KeyPressedCallback = (key: string) => void;

    /**
     * Manager for keyboard/mouse/touch events.
     */
    export class InputManager {
        private debug = false
        private view: BaseView
        private game: MainUI
        private input: Phaser.Input

        private cheats_allowed: boolean
        private cheat: boolean

        private binds: { [key: string]: KeyPressedCallback } = {}

        private keyboard_grabber: any = null
        private keyboard_callback: KeyPressedCallback | null = null

        constructor(view: BaseView) {
            this.view = view;
            this.game = view.gameui;
            this.input = view.input;
            this.cheats_allowed = true;
            this.cheat = false;

            this.input.reset(true);

            // Default mappings
            this.bind("s", "Quick save", () => {
                this.game.saveGame();
            });
            this.bind("l", "Quick load", () => {
                this.game.loadGame();
                this.game.state.start("router");
            });
            this.bind("m", "Toggle sound", () => {
                this.game.audio.toggleMute();
            });
            this.bind("f", "Toggle fullscreen", () => {
                view.toggleFullscreen();
            });
            this.bind("+", "", () => {
                if (this.cheats_allowed) {
                    this.cheat = !this.cheat;
                    this.game.displayMessage(this.cheat ? "Cheats enabled" : "Cheats disabled");
                }
            });

            this.input.keyboard.addCallbacks(this, undefined, (event: KeyboardEvent) => {
                if (this.debug) {
                    console.log(event);
                }

                if (!contains(["Control", "Shift", "Alt", "Meta"], event.key)) {
                    this.keyPress(event.key);
                    if (event.code != event.key) {
                        this.keyPress(event.code);
                    }
                }
            });
        }

        /**
         * Bind a key to a specific action.
         */
        bind(key: string, desc: string, action: Function): void {
            this.binds[key] = (key) => action();
        }

        /**
         * Bind a key to a cheat action.
         * 
         * The action will only be applied if cheat mode is activated.
         */
        bindCheat(key: string, desc: string, action: Function): void {
            this.bind(key, `Cheat: ${desc}`, () => {
                if (this.cheat) {
                    console.warn(`Cheat ! ${desc}`);
                    action();
                }
            });
        }

        /**
         * Apply a key press
         */
        keyPress(key: string): void {
            if (this.keyboard_callback) {
                this.keyboard_callback(key);
            } else if (this.binds[key]) {
                this.binds[key](key);
            }
        }

        /**
         * Grab the keyboard to receive next key presses.
         * 
         * Release will happen if another grab is made, or if releaseKeyboard is called.
         * 
         * *handle* is used to identify the grabber.
         */
        grabKeyboard(handle: any, callback: KeyPressedCallback): void {
            this.keyboard_grabber = handle;
            this.keyboard_callback = callback;
        }

        /**
         * Release the keyboard.
         */
        releaseKeyboard(handle: any): void {
            if (handle === this.keyboard_grabber) {
                this.keyboard_grabber = null;
                this.keyboard_callback = null;
            }
        }
    }
}
