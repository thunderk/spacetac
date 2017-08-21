/// <reference path="../common/UIComponent.ts" />

module TS.SpaceTac.UI {
    /**
     * Widget to display the active missions list
     */
    export class ActiveMissionsDisplay extends UIComponent {
        private missions: ActiveMissions
        private hash: number
        private markers?: MissionLocationMarker

        constructor(parent: BaseView, missions: ActiveMissions, markers?: MissionLocationMarker) {
            super(parent, 520, 240);
            this.missions = missions;
            this.hash = missions.getHash();
            this.markers = markers;

            this.update();
        }

        /**
         * Check if the active missions' status changed
         */
        checkUpdate(): boolean {
            this.missions.checkStatus();

            let new_hash = this.missions.getHash();
            if (new_hash != this.hash) {
                this.hash = new_hash;
                this.update();
                return true;
            } else {
                return false;
            }
        }

        /**
         * Update the current missions list
         */
        private update() {
            this.clearContent();

            let markers: [StarLocation | Star, string][] = [];

            let active = this.missions.getCurrent();
            let spacing = 80;
            let offset = 245 - active.length * spacing;
            active.forEach((mission, idx) => {
                let image = mission.main ? "map-mission-main" : "map-mission-standard";
                this.addImage(35, offset + spacing * idx, image);
                this.addText(90, offset + spacing * idx, mission.current_part.title, "#d2e1f3", 20, false, false, 430, true);

                let location = mission.current_part.getLocationHint();
                if (location) {
                    markers.push([location, image]);
                }
            });

            if (this.markers) {
                this.markers.setMarkers(markers);
            }
        }
    }
}