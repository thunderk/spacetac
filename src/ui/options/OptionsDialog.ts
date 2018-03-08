/// <reference path="../common/UIDialog.ts" />

module TK.SpaceTac.UI {
    /**
     * Dialog to display game options
     */
    export class OptionsDialog extends UIDialog {
        constructor(parent: BaseView) {
            super(parent, 1453, 1080, "options-background");

            this.pageMenu();
        }

        pageCommon() {
            let options = this.view.options;

            this.clearContent();
            this.addCloseButton("common-dialog-close", 1304, 131, 0, 1);

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
            let button = this.builder.button("options-toggle", x, y, undefined, tooltip, state => {
                if (callback(state)) {
                    return state;
                } else {
                    return !state;
                }
            });
            button.anchor.set(0.5);
            this.builder.in(button).image(key, 0, 0, true);
            this.builder.switch(button, initial);
            return button;
        }

        /**
         * Show the options menu
         */
        pageMenu() {
            this.pageCommon();

            if (this.view.session.primary) {
                this.addButton(this.width / 2, 600, () => this.pageInvite(), "options-button");
                this.addText(this.width / 2, 600, "Invite a friend", "#5398e9", 36, true, true);
            }

            this.addButton(this.width / 2, 800, () => this.view.gameui.quitGame(), "options-button");
            this.addText(this.width / 2, 800, "Quit to menu", "#5398e9", 36, true, true);
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

            this.addText(this.width / 2, 540, "Give this invite code to your friend:", "#5398e9", 36, false, true);
            this.addText(this.width / 2, 620, token, "#d6d6bd", 36, true, true);
            this.addText(this.width / 2, 700, "Waiting for a connection...", "#b39256", 36, false, true);

            this.addButton(this.width / 2, 840, () => this.pageMenu(), "options-button");
            this.addText(this.width / 2, 840, "Cancel", "#5398e9", 36, true, true);
        }

        /**
         * Display a connection error
         */
        private displayConnectionError() {
            this.pageCommon();

            this.addText(this.width / 2, 620, "Could not establish connection to server", "#b35b56", 36, true, true);

            this.addButton(this.width / 2, 840, () => this.pageMenu(), "options-button");
            this.addText(this.width / 2, 840, "Cancel", "#5398e9", 36, true, true);
        }
    }
}
