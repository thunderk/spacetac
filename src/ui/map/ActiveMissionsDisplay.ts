/// <reference path="../common/UIComponent.ts" />

module TS.SpaceTac.UI {
    /**
     * Widget to display the active missions list
     */
    export class ActiveMissionsDisplay extends UIComponent {
        private missions: ActiveMissions

        constructor(parent: BaseView, missions: ActiveMissions) {
            super(parent, 520, 210);
            this.missions = missions;

            this.update();
        }

        /**
         * Update the current missions list
         */
        update() {
            this.clearContent();

            let active = this.missions.getCurrent();
            let offset = 245 - active.length * 70;
            active.forEach((mission, idx) => {
                this.addImage(35, offset + 70 * idx, "map-missions");
                this.addText(90, offset + 70 * idx, mission.current_part.title, "#d2e1f3", 22, false, false, 430, true);
            });
        }
    }
}