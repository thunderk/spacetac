module TK.SpaceTac.UI {
    /**
     * Marker to show a mission location on the map
     */
    export class MissionLocationMarker {
        private view: BaseView
        private container: Phaser.Group
        private markers: [StarLocation | Star, string][]
        private zoomed = true
        private current_star: Star

        constructor(view: BaseView, parent: Phaser.Group) {
            this.view = view;
            this.container = view.game.add.group(parent, "mission_markers");
        }

        /**
         * Set the active markers (location and image name)
         */
        setMarkers(markers: [StarLocation | Star, string][]): void {
            this.markers = markers;
            this.refresh();
        }

        /**
         * Set the zoom level
         */
        setZoom(level: number, star: Star): void {
            this.zoomed = level >= 2;
            this.current_star = star;
            this.refresh();
        }

        /**
         * Refresh the display
         */
        refresh(): void {
            this.container.removeAll(true);

            this.markers.forEach(([location, name], index) => {
                let focus = this.zoomed ? location : (location instanceof StarLocation ? location.star : location);
                if (location !== this.current_star || !this.zoomed) {
                    let marker = this.getMarker(focus, index - 1);
                    let image = this.view.newImage(name, marker.x, marker.y);
                    image.scale.set(marker.scale);
                    image.anchor.set(0.5);
                    this.container.add(image);
                }
            });
        }

        private getMarker(focus: Star | StarLocation, offset: number): { x: number, y: number, scale: number } {
            if (focus instanceof StarLocation) {
                let system = focus.star;
                return {
                    x: focus.universe_x + offset * system.radius * 0.05,
                    y: focus.universe_y - system.radius * 0.08,
                    scale: system.radius * 0.001
                }
            } else {
                return {
                    x: focus.x + offset * focus.radius * 0.6,
                    y: focus.y - focus.radius * 0.7,
                    scale: focus.radius * 0.01
                }
            }

        }
    }
}