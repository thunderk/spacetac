/// <reference path="../common/UIComponent.ts" />

module TK.SpaceTac.UI {
    /**
     * Menu to display selected map location, and associated actions
     */
    export class MapLocationMenu {
        readonly container: UIContainer
        private content: UIBuilder

        constructor(private view: BaseView, parent?: UIContainer, x = 0, y = 0) {
            let builder = new UIBuilder(view, parent);
            this.container = builder.container("location-menu", x, y);
            this.content = builder.in(this.container);
        }

        /**
         * Set information displayed, with title and actions to show in menu
         */
        setInfo(title: string, actions: [string, Function][]) {
            this.content.clear();

            if (title) {
                this.content.image("map-subname", 239, 57, true);
                this.content.text(title, 239, 57, { color: "#b8d2f1", size: 22 })
            }

            for (let idx = actions.length - 1; idx >= 0; idx--) {
                let [label, action] = actions[idx];
                this.content.button("map-action", 172, 48 + idx * 100 + 96, action, undefined, undefined, { center: true });
                this.content.text(label, 186, 48 + idx * 100 + 136, { color: "#b8d2f1", size: 20 });
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