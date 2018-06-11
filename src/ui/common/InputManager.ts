module TK.SpaceTac.UI {
    export type KeyPressedCallback = (key: string) => void

    /**
     * Manager for keyboard/mouse/touch events.
     */
    export class InputManager {
        private debug = false
        private view: BaseView
        private game: MainUI
        private input: Phaser.Input.InputManager

        private cheats_allowed: boolean
        private cheat: boolean

        private hovered: UIButton | UIContainer | UIImage | null = null

        private binds: { [key: string]: KeyPressedCallback } = {}

        private keyboard_grabber: any = null
        private keyboard_callback: KeyPressedCallback | null = null

        constructor(view: BaseView) {
            this.view = view;
            this.game = view.gameui;
            this.input = view.input.manager;
            this.cheats_allowed = true;
            this.cheat = false;

            // Default mappings
            this.bind("s", "Quick save", () => {
                this.game.saveGame();
            });
            this.bind("l", "Quick load", () => {
                this.game.loadGame();
                this.view.backToRouter();
            });
            this.bind("m", "Toggle sound", () => {
                this.game.options.setNumberValue("mainvolume", this.game.options.getNumberValue("mainvolume") > 0 ? 0 : 1);
            });
            this.bind("f", "Toggle fullscreen", () => {
                this.game.options.setBooleanValue("fullscreen", !this.game.options.getBooleanValue("fullscreen"));
            });
            this.bind("+", "", () => {
                if (this.cheats_allowed) {
                    this.cheat = !this.cheat;
                    this.game.displayMessage(this.cheat ? "Cheats enabled" : "Cheats disabled");
                }
            });

            if (!this.game.headless) {
                this.input.keyboard.on("keyup", (event: KeyboardEvent) => {
                    if (this.debug) {
                        console.log(event);
                    }

                    this.forceLeaveHovered();

                    if (!contains(["Control", "Shift", "Alt", "Meta"], event.key)) {
                        this.keyPress(event.key);
                        if (event.code != event.key) {
                            this.keyPress(event.code);
                        }
                    }
                });
            }
        }

        /**
         * Remove the bindings
         */
        destroy(): void {
            this.input.keyboard.removeAllListeners("keyup");
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
                    this.game.displayMessage(`Cheat ! ${desc}`);
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

        /**
         * Force the cursor out of currently hovered object
         */
        private forceLeaveHovered() {
            if (this.hovered && this.hovered.data) {
                let pointer = this.hovered.data.get("pointer");
                if (pointer) {
                    this.hovered.emit("pointerout", pointer);
                }
            }
        }

        /**
         * Setup hover/click handlers on an UI element
         * 
         * This is done in a way that should be compatible with touch-enabled screen
         */
        setHoverClick(obj: UIButton | UIContainer | UIImage, enter: Function = nop, leave: Function = nop, click: Function = nop, hovertime = 300, holdtime = 600, sound = false): void {
            let holdstart = Timer.nowMs();
            let enternext: Function | null = null;
            let entercalled = false;
            let cursorinside = false;
            let destroyed = false;

            obj.setDataEnabled();

            if (obj instanceof UIImage) {
                obj.setInteractive();
            } else if (!(obj instanceof UIButton)) {
                let bounds = obj.getBounds();
                bounds.x -= obj.x;
                bounds.y -= obj.y;
                obj.setInteractive(bounds, Phaser.Geom.Rectangle.Contains);
            }

            let prevententer = () => {
                if (enternext != null) {
                    Timer.global.cancel(enternext);
                    enternext = null;
                    return true;
                } else {
                    return false;
                }
            };

            let effectiveenter = () => {
                if (!destroyed) {
                    enternext = null;
                    entercalled = true;
                    enter();
                }
            }

            let effectiveleave = () => {
                prevententer();
                if (entercalled) {
                    entercalled = false;
                    leave();
                }
            }

            obj.on("destroy", () => {
                destroyed = true;
                effectiveleave();
            });

            obj.on("pointerover", (pointer: Phaser.Input.Pointer) => {
                if (destroyed || !UITools.isVisible(obj)) return;

                if (this.hovered) {
                    if (this.hovered === obj) {
                        return;
                    } else {
                        this.forceLeaveHovered();
                    }
                }
                this.hovered = obj;
                this.hovered.data.set("pointer", pointer);

                cursorinside = true;
                enternext = Timer.global.schedule(hovertime, effectiveenter);
            });

            obj.on("pointerout", () => {
                if (destroyed) return;

                if (this.hovered === obj) {
                    this.hovered = null;
                }

                cursorinside = false;
                effectiveleave();
            });

            obj.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                if (destroyed || pointer.buttons != 1) return;

                if (UITools.isVisible(obj)) {
                    holdstart = Timer.nowMs();
                    if (sound) {
                        this.view.audio.playOnce("ui-button-down");
                    }
                    if (!cursorinside && !enternext) {
                        enternext = Timer.global.schedule(holdtime, effectiveenter);
                    }
                }
            });

            obj.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                if (destroyed || pointer.buttons != 1) return;

                if (!cursorinside) {
                    effectiveleave();
                }

                if (Timer.fromMs(holdstart) < holdtime) {
                    if (!cursorinside) {
                        effectiveenter();
                    }
                    if (sound) {
                        this.view.audio.playOnce("ui-button-up");
                    }
                    click();
                    if (!cursorinside) {
                        effectiveleave();
                    }
                }
            });
        }
    }
}
