module TS.SpaceTac.UI {
    /**
     * Dialog to show available missions
     */
    export class MissionsDialog extends UIDialog {
        shop: Shop
        player: Player
        location: StarLocation

        constructor(view: BaseView, shop: Shop, player: Player) {
            super(view);

            this.shop = shop;
            this.player = player;
            this.location = player.fleet.location || new StarLocation();

            this.refresh();
        }

        /**
         * Refresh the dialog content
         */
        refresh() {
            this.clearContent();
            this.addCloseButton();

            let offset = 160;

            let active = this.player.missions.getCurrent().filter(mission => !mission.main);
            if (active.length) {
                this.addText(this.width / 2, offset, "Active jobs", "#b8d2f1", 36);
                offset += 110;

                active.forEach(mission => {
                    this.addMission(offset, mission.title, "Reward: ???", 0, () => null);
                    offset += 110;
                });
            }

            let proposed = this.shop.getMissions(this.location);
            if (proposed.length) {
                this.addText(this.width / 2, offset, "Proposed jobs", "#b8d2f1", 36);
                offset += 110;

                proposed.forEach(mission => {
                    this.addMission(offset, mission.title, "Reward: ???", 2, () => {
                        this.shop.acceptMission(mission, this.player);
                        this.refresh();
                    });
                    offset += 110;
                });
            }
        }

        /**
         * Add a mission text
         */
        addMission(yoffset: number, title: string, subtitle: string, button_frame: number, button_callback: Function) {
            this.addImage(320, yoffset, "map-missions", 1);
            if (title) {
                this.addText(380, yoffset - 15, title, "#d2e1f3", 22, false, false, 620, true);
            }
            if (subtitle) {
                this.addText(380, yoffset + 22, subtitle, "#d2e1f3", 20, false, false, 620, true);
            }
            this.addButton(1120, yoffset, button_callback, "map-mission-action", button_frame, button_frame + 1);
        }
    }
}