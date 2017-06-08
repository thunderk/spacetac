/// <reference path="../common/UIDialog.ts" />

module TS.SpaceTac.UI {
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

            let toggle = this.addToggleButton(415, 381,
                { key: "options-toggle", frame: 0, frame1: 1, frame2: 2 },
                { key: "options-options", frame: 0 },
                toggled => options.setNumberValue("mainvolume", toggled ? 1 : 0));
            toggle(options.getNumberValue("mainvolume") > 0);

            toggle = this.addToggleButton(this.width / 2, 381,
                { key: "options-toggle", frame: 0, frame1: 1, frame2: 2 },
                { key: "options-options", frame: 1 },
                toggled => options.setNumberValue("musicvolume", toggled ? 1 : 0));
            toggle(options.getNumberValue("musicvolume") > 0);

            toggle = this.addToggleButton(this.width - 415, 381,
                { key: "options-toggle", frame: 0, frame1: 1, frame2: 2 },
                { key: "options-options", frame: 2 },
                toggled => options.setBooleanValue("fullscreen", toggled));
            toggle(options.getBooleanValue("fullscreen"));
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
        pageInvite() {
            this.pageCommon();

            let conn = this.view.getConnection();
            conn.publish(this.view.session, "Multiplayer invitation").then(token => {
                this.addText(this.width / 2, 540, "Give this invite code to your friend:", "#5398e9", 36, false, true);
                this.addText(this.width / 2, 620, token, "#d6d6bd", 36, true, true);
                this.addText(this.width / 2, 700, "Waiting for a connection...", "#b39256", 36, false, true);

                this.addButton(this.width / 2, 840, () => this.pageMenu(), "options-button");
                this.addText(this.width / 2, 840, "Cancel", "#5398e9", 36, true, true);
            }).catch(() => {
                this.addText(this.width / 2, 620, "Could not establish connection to server", "#b35b56", 36, true, true);

                this.addButton(this.width / 2, 840, () => this.pageMenu(), "options-button");
                this.addText(this.width / 2, 840, "Cancel", "#5398e9", 36, true, true);
            });
        }
    }
}
