module TK.SpaceTac.UI {
    /**
     * Graphical hints for movement and weapon range
     */
    export class RangeHint {
        // Link to the view
        private view: BaseView

        // Visual information
        private info: UIGraphics

        // Size of the arena
        private width: number
        private height: number

        constructor(arena: Arena) {
            this.view = arena.view;

            let boundaries = arena.getBoundaries();
            this.width = boundaries.width;
            this.height = boundaries.height;

            this.info = new UIGraphics(arena.view, "info", false);
        }

        /**
         * Set the layer in which the info will be displayed
         */
        setLayer(layer: UIContainer, x = 0, y = 0) {
            this.info.setPosition(x, y);
            layer.add(this.info);
        }

        /**
         * Clear displayed information
         */
        clear() {
            this.info.clear();
            this.info.visible = false;
        }

        /**
         * Update displayed information
         */
        update(ship: Ship, action: BaseAction, radius = action.getRangeRadius(ship)): void {
            let yescolor = 0x000000;
            let nocolor = 0x242022;
            this.info.clear();

            if (radius) {
                this.info.fillStyle(nocolor);
                this.info.fillRect(0, 0, this.width, this.height);

                this.info.fillStyle(yescolor);
                this.info.fillCircle(ship.arena_x, ship.arena_y, radius);

                if (action instanceof MoveAction) {
                    let exclusions = action.getExclusionAreas(ship);

                    this.info.fillStyle(nocolor);
                    this.info.fillRect(0, 0, this.width, exclusions.hard_border);
                    this.info.fillRect(0, this.height - exclusions.hard_border, this.width, exclusions.hard_border);
                    this.info.fillRect(0, exclusions.hard_border, exclusions.hard_border, this.height - exclusions.hard_border * 2);
                    this.info.fillRect(this.width - exclusions.hard_border, exclusions.hard_border, exclusions.hard_border, this.height - exclusions.hard_border * 2);

                    exclusions.obstacles.forEach(obstacle => {
                        this.info.fillCircle(obstacle.x, obstacle.y, exclusions.effective_obstacle);
                    });
                }

                this.info.visible = true;
            } else {
                this.info.visible = false;
            }
        }
    }
}
