/// <reference path="../common/UIContainer.ts" />

module TK.SpaceTac.UI {
    /**
     * Widget to display the active missions list
     */
    export class ActiveMissionsDisplay {
        readonly container: UIContainer
        private builder: UIBuilder
        private missions: ActiveMissions
        private hash: number
        private markers?: MissionLocationMarker

        constructor(view: BaseView, missions: ActiveMissions, markers?: MissionLocationMarker) {
            let builder = new UIBuilder(view);
            this.container = builder.container("active-missions");
            this.builder = builder.in(this.container);
            this.missions = missions;
            this.hash = missions.getHash();
            this.markers = markers;

            this.update();
        }

        /**
         * Move to a specific location inside a parent
         */
        moveTo(parent: UIContainer, x: number, y: number): void {
            parent.add(this.container);
            this.container.setPosition(x, y);
        }

        setVisible(visible: boolean, duration = 0): void {
            this.container.setVisible(visible, duration);
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
            this.container.removeAll(true);

            let markers: [StarLocation | Star, string][] = [];

            let active = this.missions.getCurrent();
            let spacing = 80;
            let offset = 245 - active.length * spacing;
            active.forEach((mission, idx) => {
                let image = mission.main ? "map-mission-main" : "map-mission-standard";
                this.builder.image(image, 35, offset + spacing * idx, true);
                this.builder.text(mission.current_part.title, 90, offset + spacing * idx, {
                    color: "#d2e1f3",
                    size: 20,
                    width: 430,
                    center: false,
                    vcenter: true
                });

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