module TK.SpaceTac.UI {
    export type KeyPressedCallback = (key: string) => void

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

        private hovered: Phaser.Button | null = null

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
                this.input.keyboard.addCallbacks(this, undefined, (event: KeyboardEvent) => {
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

        /**
         * Force the cursor out of currently hovered object
         */
        private forceLeaveHovered() {
            if (this.hovered && this.hovered.data.hover_pointer) {
                (<any>this.hovered.input)._pointerOutHandler(this.hovered.data.hover_pointer);
            }
        }

        /**
         * Setup dragging on an UI component
         * 
         * If no drag or drop function is defined, dragging is disabled
         * 
         * If update function is defined, it will receive (a lot of) cursor moves while dragging
         */
        setDragDrop(obj: Phaser.Button | Phaser.Image, drag?: Function, drop?: Function, update?: Function): void {
            obj.events.onDragStart.removeAll();
            obj.events.onDragStop.removeAll();
            obj.events.onDragUpdate.removeAll();

            if (drag && drop) {
                obj.inputEnabled = true;
                obj.input.enableDrag(false, true);

                obj.events.onDragStart.add(() => {
                    this.forceLeaveHovered();
                    this.view.audio.playOnce("ui-drag");
                    drag();
                });

                obj.events.onDragStop.add(() => {
                    this.view.audio.playOnce("ui-drop");
                    drop();
                });

                if (update) {
                    obj.events.onDragUpdate.add(() => {
                        update();
                    });
                }
            } else {
                obj.input.disableDrag();
            }
        }

        /**
         * Setup hover/click handlers on an UI element
         * 
         * This is done in a way that should be compatible with touch-enabled screen
         * 
         * Returns functions that may be used to force the behavior
         */
        setHoverClick(obj: Phaser.Button, enter: Function = nop, leave: Function = nop, click: Function = nop, hovertime = 300, holdtime = 600) {
            let holdstart = Timer.nowMs();
            let enternext: Function | null = null;
            let entercalled = false;
            let cursorinside = false;
            let destroyed = false;

            obj.input.useHandCursor = true;

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

            if (obj.events) {
                obj.events.onDestroy.addOnce(() => {
                    destroyed = true;
                    effectiveleave();
                });
            }

            obj.onInputOver.add((_: any, pointer: Phaser.Pointer) => {
                if (destroyed) return;

                if (this.hovered) {
                    if (this.hovered === obj) {
                        return;
                    } else {
                        this.forceLeaveHovered();
                    }
                }
                this.hovered = obj;
                this.hovered.data.hover_pointer = pointer;

                if (obj.visible && obj.alpha) {
                    cursorinside = true;
                    enternext = Timer.global.schedule(hovertime, effectiveenter);
                }
            });

            obj.onInputOut.add(() => {
                if (destroyed) return;

                if (this.hovered === obj) {
                    this.hovered = null;
                }

                cursorinside = false;
                effectiveleave();
            });

            obj.onInputDown.add(() => {
                if (destroyed) return;

                if (obj.visible && obj.alpha) {
                    holdstart = Timer.nowMs();
                    if (!cursorinside && !enternext) {
                        enternext = Timer.global.schedule(holdtime, effectiveenter);
                    }
                }
            });

            obj.onInputUp.add(() => {
                if (destroyed) return;

                if (!cursorinside) {
                    effectiveleave();
                }

                if (Timer.fromMs(holdstart) < holdtime) {
                    if (!cursorinside) {
                        effectiveenter();
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
