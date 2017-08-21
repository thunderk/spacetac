/// <reference path="../common/UIComponent.ts" />

module TS.SpaceTac.UI {
    /**
     * Menu to display selected map location, and associated actions
     */
    export class MapLocationMenu extends UIComponent {
        constructor(view: BaseView) {
            super(view, 478, 500);
        }

        /**
         * Set information displayed, with title and actions to show in menu
         */
        setInfo(title: string, actions: [string, Function][]) {
            this.clearContent();

            if (title) {
                this.addImageF(239, 57, "map-subname");
                this.addText(239, 57, title, "#b8d2f1", 22, false, true);
            }

            for (let idx = actions.length - 1; idx >= 0; idx--) {
                let [label, action] = actions[idx];
                this.addButton(172, 48 + idx * 100 + 96, action, "map-action", 0, 1);
                this.addText(186, 48 + idx * 100 + 136, label, "#b8d2f1", 20, false, true);
            }
        }

        /**
         * Automatically set menu content from current location
         */
        setFromLocation(location: StarLocation | null, view: UniverseMapView) {
            if (location) {
                let actions: [string, Function][] = [];
                if (location.shop) {
                    let shop = location.shop;
                    actions.push(["Go to dockyard", () => view.openShop()]);
                    actions.push(["Show jobs", () => view.openMissions()]);
                }

                switch (location.type) {
                    case StarLocationType.WARP:
                        this.setInfo("Warp-zone", actions.concat([["Engage jump drive", () => view.doJump()]]));
                        break;
                    case StarLocationType.STAR:
                        this.setInfo("Class II Star", actions);
                        break;
                    case StarLocationType.PLANET:
                        this.setInfo("Rock planet", actions);
                        break;
                    case StarLocationType.ASTEROID:
                        this.setInfo("Huge asteroid", actions);
                        break;
                    case StarLocationType.STATION:
                        this.setInfo("Space station", actions);
                        break;
                    default:
                        this.setInfo("Somewhere in space", actions);
                        break;
                }
            } else {
                this.setInfo("", []);
            }
        }
    }
}