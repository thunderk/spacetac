/// <reference path="../common/UIComponent.ts" />

module TS.SpaceTac.UI {
    /**
     * Widget to display the active missions list
     */
    export class ActiveMissionsDisplay extends UIComponent {
        private missions: ActiveMissions

        constructor(parent: BaseView, missions: ActiveMissions) {
            super(parent, 520, 240);
            this.missions = missions;

            this.update();
        }

        /**
         * Update the current missions list
         */
        update() {
            this.clearContent();

            let active = this.missions.getCurrent();
            let spacing = 80;
            let offset = 245 - active.length * spacing;
            active.forEach((mission, idx) => {
                this.addImage(35, offset + spacing * idx, "map-missions", mission.main ? 0 : 1);
                this.addText(90, offset + spacing * idx, mission.current_part.title, "#d2e1f3", 20, false, false, 430, true);
            });
        }
    }
}