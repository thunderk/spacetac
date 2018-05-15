module TK.SpaceTac.UI {
    /**
     * UI component able to contain other UI components
     */
    export class UIContainer extends Phaser.GameObjects.Container {
        /**
         * Fixed version that does not force (0, 0) to be in bounds
         */
        getBounds(output?: Phaser.Geom.Rectangle): Phaser.Geom.Rectangle {
            let result: IBounded = { x: 0, y: 0, width: 0, height: 0 };

            if (this.list.length > 0) {
                var children = this.list;

                for (var i = 0; i < children.length; i++) {
                    var entry = children[i];

                    if (UITools.isSpatial(entry)) {
                        result = UITools.unionRects(result, entry.getBounds());
                    }
                }
            }

            if (typeof output == "undefined") {
                output = new Phaser.Geom.Rectangle();
            }
            output.setTo(result.x, result.y, result.width, result.height);
            return output;
        }
    }
}