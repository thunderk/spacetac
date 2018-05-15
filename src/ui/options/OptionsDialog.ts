/// <reference path="../common/UIDialog.ts" />

module TK.SpaceTac.UI {
    /**
     * Dialog to display game options
     */
    export class OptionsDialog extends UIDialog {
        constructor(parent: BaseView, credits = false) {
            super(parent);

            if (credits) {
                this.pageCredits();
            } else {
                this.pageMenu();
            }

            this.addCloseButton();
        }

        pageCommon() {
            let options = this.view.options;

            this.content.clear();

            this.content.image("options-logo", 473, 71);
            this.content.image("options-buttons-background", 244, 357);

            this.addToggleButton(415, 381, "options-option-sound", "Toggle all sound",
                toggled => options.setNumberValue("mainvolume", toggled ? 1 : 0),
                options.getNumberValue("mainvolume") > 0
            );

            this.addToggleButton(this.width / 2, 381, "options-option-music", "Toggle music",
                toggled => options.setNumberValue("musicvolume", toggled ? 1 : 0),
                options.getNumberValue("musicvolume") > 0
            );

            this.addToggleButton(this.width - 415, 381, "options-option-fullscreen", "Toggle fullscreen",
                toggled => options.setBooleanValue("fullscreen", toggled),
                options.getBooleanValue("fullscreen")
            );
        }

        /**
         * Add a toggle button
         */
        addToggleButton(x: number, y: number, key: string, tooltip: string, callback: (state: boolean) => boolean, initial: boolean): UIButton {
            let button = this.content.button("options-toggle", x, y, undefined, tooltip, state => {
                if (callback(state)) {
                    return state;
                } else {
                    return !state;
                }
            }, { center: true });
            this.content.in(button).image(key, 0, 0, true);
            button.toggle(initial);
            return button;
        }

        /**
         * Show the options menu
         */
        pageMenu() {
            this.pageCommon();

            if (this.view.session.primary) {
                this.content.button("options-button", this.width / 2, 600, () => this.pageInvite(), "Invite a friend to join this game as spectator", undefined, {
                    center: true,
                    text: "Invite a friend",
                    text_style: {
                        color: "#9fc4d6",
                        size: 36,
                    }
                });
            }

            this.content.button("options-button", this.width / 2, 800, () => this.view.gameui.quitGame(), "End the current game and go back to main menu", undefined, {
                center: true,
                text: "Quit to menu",
                text_style: {
                    color: "#9fc4d6",
                    size: 36,
                }
            });
        }

        /**
         * Show the credits info
         */
        pageCredits() {
            this.pageCommon();

            this.content.text("Credits", this.width / 2, 566, { center: true, size: 48, color: "#dbeff9", shadow: true });
            let credits = "Michaël Lemaire - Code and graphics\n\
Viktor Hahn - Ship models\n\
KenneyNL - Sound effects\n\
Matthieu Desprez - Beta testing and ideas\n\
Néstor Delgado - Font\n\
Nicolas Forgo - Ship models\n\
Kevin MacLeod - Musics";
            this.content.text(credits, this.width / 2, 754, { center: true, size: 24, color: "#9fc4d6", shadow: true });
        }

        /**
         * Show the invite page
         */
        async pageInvite() {
            this.pageCommon();

            let conn = this.view.getConnection();
            try {
                let token = await conn.publish(this.view.session, "Multiplayer invitation");
                this.displayMultiplayerToken(token);

                if (this.view instanceof BattleView) {
                    await this.view.multi.setup(this.view, this.view.actual_battle, token, true);
                } else {
                    // TODO
                    this.displayConnectionError();
                }

                this.close();
            } catch (err) {
                this.displayConnectionError();
            }
        }

        /**
         * Display a multiplayer token page
         */
        private displayMultiplayerToken(token: string) {
            this.pageCommon();

            this.content.styled({ size: 36 }, content => {
                content.text("Give this invite code to your friend:", this.width / 2, 540, { color: "#dbeff9" });
                content.text(token, this.width / 2, 620, { color: "#9FC4D6" });
                content.text("Waiting for a connection...", this.width / 2, 700, { color: "#BF9757" });
            });

            this.content.button("options-button", this.width / 2, 840, () => this.pageMenu(), "Cancel waiting for the other person to connect", undefined, {
                center: true,
                text: "Cancel",
                text_style: {
                    color: "#9fc4d6",
                    size: 36,
                }
            });
        }

        /**
         * Display a connection error
         */
        private displayConnectionError() {
            this.pageCommon();

            this.content.text("Could not establish connection to server", this.width / 2, 620, {
                color: "#b35b56",
                size: 36,
                bold: true
            });

            this.content.button("options-button", this.width / 2, 840, () => this.pageMenu(), "Cancel the connection", undefined, {
                center: true,
                text: "Cancel",
                text_style: {
                    color: "#9fc4d6",
                    size: 36,
                }
            });
        }
    }
}
