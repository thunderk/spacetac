module TK.SpaceTac.UI {
    /**
     * Marker to show a mission location on the map
     */
    export class MissionLocationMarker {
        private builder: UIBuilder
        private markers: [StarLocation | Star, string][] = []
        private zoomed = true
        private current_star?: Star

        constructor(private view: BaseView, parent: UIContainer) {
            this.view = view;

            let builder = new UIBuilder(view, parent);
            this.builder = builder.in(builder.container("mission_markers"));
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
            this.builder.clear();

            this.markers.forEach(([location, name], index) => {
                let focus = this.zoomed ? location : (location instanceof StarLocation ? location.star : location);
                if (location !== this.current_star || !this.zoomed) {
                    let marker = this.getMarker(focus, index - 1);
                    let image = this.builder.image(name, marker.x, marker.y);
                    image.setScale(marker.scale);
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