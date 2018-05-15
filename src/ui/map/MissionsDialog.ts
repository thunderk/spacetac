module TK.SpaceTac.UI {
    /**
     * Dialog to show available missions
     */
    export class MissionsDialog extends UIDialog {
        shop: Shop
        player: Player
        location: StarLocation
        on_change: Function

        constructor(view: BaseView, shop: Shop, player: Player, on_change?: Function) {
            super(view);

            this.shop = shop;
            this.player = player;
            this.location = view.session.getLocation();
            this.on_change = on_change || (() => null);

            this.addCloseButton();
            this.refresh();
        }

        /**
         * Refresh the dialog content
         */
        refresh() {
            this.content.clear();

            let offset = 160;

            let active = this.player.missions.getCurrent().filter(mission => !mission.main);
            if (active.length) {
                this.content.text("Active jobs", this.width / 2, offset, { color: "#b8d2f1", size: 36 });
                offset += 110;

                active.forEach(mission => {
                    this.addMission(offset, mission, true, () => null);
                    offset += 110;
                });
            }

            let proposed = this.shop.getMissions(this.location);
            if (proposed.length) {
                this.content.text("Proposed jobs", this.width / 2, offset, { color: "#b8d2f1", size: 36 });
                offset += 110;

                proposed.forEach(mission => {
                    this.addMission(offset, mission, false, () => {
                        this.shop.acceptMission(mission, this.player);
                        this.close();
                        this.on_change();
                    });
                    offset += 110;
                });
            }
        }

        /**
         * Add a mission text
         */
        addMission(yoffset: number, mission: Mission, active: boolean, button_callback: Function) {
            let title = mission.title;
            let subtitle = `${capitalize(MissionDifficulty[mission.difficulty])} - Reward: ${mission.getRewardText()}`;

            this.content.image("map-mission-standard", 320, yoffset, true);
            if (title) {
                this.content.text(title, 380, yoffset - 15, { color: "#d2e1f3", size: 22, width: 620, center: false });
            }
            if (subtitle) {
                this.content.text(subtitle, 380, yoffset + 22, { color: "#d2e1f3", size: 18, width: 620, center: false });
            }
            this.content.button(active ? "map-mission-action-cancel" : "map-mission-action-accept", 1120, yoffset, button_callback, undefined, undefined, { center: true });
        }
    }
}