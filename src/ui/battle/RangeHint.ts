module TK.SpaceTac.UI {
    /**
     * Graphical hints for movement and weapon range
     */
    export class RangeHint {
        // Link to the view
        private view: BaseView

        // Visual information
        private info: Phaser.Graphics

        // Size of the arena
        private width: number
        private height: number

        constructor(arena: Arena) {
            this.view = arena.view;

            let boundaries = arena.getBoundaries();
            this.width = boundaries.width;
            this.height = boundaries.height;

            this.info = new Phaser.Graphics(arena.game, 0, 0);
            this.info.visible = false;
        }

        /**
         * Set the layer in which the info will be displayed
         */
        setLayer(layer: Phaser.Group, x = 0, y = 0) {
            this.info.position.set(x, y);
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
                this.info.beginFill(nocolor);
                this.info.drawRect(0, 0, this.width, this.height);

                this.info.beginFill(yescolor);
                this.info.drawCircle(ship.arena_x, ship.arena_y, radius * 2);

                if (action instanceof MoveAction) {
                    let exclusions = action.getExclusionAreas(ship);

                    this.info.beginFill(nocolor);
                    this.info.drawRect(0, 0, this.width, exclusions.hard_border);
                    this.info.drawRect(0, this.height - exclusions.hard_border, this.width, exclusions.hard_border);
                    this.info.drawRect(0, exclusions.hard_border, exclusions.hard_border, this.height - exclusions.hard_border * 2);
                    this.info.drawRect(this.width - exclusions.hard_border, exclusions.hard_border, exclusions.hard_border, this.height - exclusions.hard_border * 2);

                    exclusions.obstacles.forEach(obstacle => {
                        this.info.drawCircle(obstacle.x, obstacle.y, exclusions.effective_obstacle * 2);
                    });
                }

                this.info.visible = true;
            } else {
                this.info.visible = false;
            }
        }
    }
}
