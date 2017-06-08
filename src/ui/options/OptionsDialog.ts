/// <reference path="../common/UIDialog.ts" />

module TS.SpaceTac.UI {
    /**
     * Dialog to display game options
     */
    export class OptionsDialog extends UIDialog {
        constructor(parent: BaseView) {
            super(parent, 1453, 1080, "options-background");

            this.addCloseButton("common-dialog-close", 1304, 131, 0, 1);

            let toggle = this.addToggleButton(415, 381,
                { key: "options-toggle", frame: 0, frame1: 1, frame2: 2 },
                { key: "options-options", frame: 0 },
                toggled => parent.options.setNumberValue("mainvolume", toggled ? 1 : 0));
            toggle(parent.options.getNumberValue("mainvolume") > 0);

            toggle = this.addToggleButton(this.width / 2, 381,
                { key: "options-toggle", frame: 0, frame1: 1, frame2: 2 },
                { key: "options-options", frame: 1 },
                toggled => parent.options.setNumberValue("musicvolume", toggled ? 1 : 0));
            toggle(parent.options.getNumberValue("musicvolume") > 0);

            toggle = this.addToggleButton(this.width - 415, 381,
                { key: "options-toggle", frame: 0, frame1: 1, frame2: 2 },
                { key: "options-options", frame: 2 },
                toggled => parent.options.setBooleanValue("fullscreen", toggled));
            toggle(parent.options.getBooleanValue("fullscreen"));

            this.addButton(this.width / 2, 600, () => null, "options-button");
            this.addText(this.width / 2, 600, "Invite a friend", "#5398e9", 36, true, true);

            this.addButton(this.width / 2, 800, () => parent.gameui.quitGame(), "options-button");
            this.addText(this.width / 2, 800, "Quit to menu", "#5398e9", 36, true, true);
        }
    }
}
