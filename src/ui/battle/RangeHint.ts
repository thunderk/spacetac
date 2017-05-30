module TS.SpaceTac.UI {
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
            this.view = arena.battleview;

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
        update(ship: Ship, action: BaseAction): void {
            let yescolor = 0x000000;
            let nocolor = 0x242022;
            this.info.clear();

            var radius = action.getRangeRadius(ship);
            if (radius) {
                this.info.beginFill(nocolor);
                this.info.drawRect(0, 0, this.width, this.height);

                this.info.beginFill(yescolor);
                this.info.drawCircle(ship.arena_x, ship.arena_y, radius * 2);

                if (action instanceof MoveAction) {
                    let safety = action.safety_distance / 2;
                    this.info.beginFill(nocolor);
                    this.info.drawRect(0, 0, this.width, safety);
                    this.info.drawRect(0, this.height - safety, this.width, safety);
                    this.info.drawRect(0, safety, safety, this.height - safety * 2);
                    this.info.drawRect(this.width - safety, safety, safety, this.height - safety * 2);

                    let battle = ship.getBattle();
                    if (battle) {
                        iforeach(battle.iships(true), s => {
                            if (s !== ship) {
                                this.info.drawCircle(s.arena_x, s.arena_y, safety * 4);
                            }
                        });
                    }
                }

                this.info.visible = true;
            } else {
                this.info.visible = false;
            }
        }
    }
}
