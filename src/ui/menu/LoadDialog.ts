/// <reference path="../common/UIComponent.ts"/>

module TS.SpaceTac.UI {
    /**
     * Dialog to load a saved game, or join an online one
     */
    export class LoadDialog extends UIComponent {
        constructor(parent: MainMenu) {
            super(parent, 1344, 566, "menu-load-bg");

            this.addButton(600, 115, () => null, "common-arrow", "common-arrow", 180);
            this.addButton(1038, 115, () => null, "common-arrow", "common-arrow", 0);
            this.addButton(1224, 115, () => null, "common-button-cancel");
            this.addButton(1224, 341, () => null, "common-button-cancel");
        }
    }
}
