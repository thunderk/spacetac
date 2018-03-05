module TK.SpaceTac.UI {
    export type IBounded = {
        x: number
        y: number
        width: number
        height: number
    }

    /**
     * Destroy all children of a Phaser object
     * 
     * This is a workaround for a removeChildren bug
     */
    export function destroyChildren(obj: Phaser.Image | Phaser.Sprite | Phaser.Group, start = 0, end = obj.children.length - 1) {
        obj.children.slice(start, end + 1).forEach(child => (<any>child).destroy());
    }

    // Common UI tools functions
    export class UITools {
        /**
         * Get the screen bounding rectanle of a displayed object
         * 
         * This is a workaround for bugs in getLocalBounds and getBounds
         */
        static getScreenBounds(obj: Phaser.Image | Phaser.Sprite | Phaser.Group | Phaser.Graphics): IBounded {
            obj.updateTransform();

            let rects: IBounded[] = [obj.getBounds()];
            obj.children.forEach(child => {
                if (child instanceof Phaser.Image || child instanceof Phaser.Sprite || child instanceof Phaser.Group || child instanceof Phaser.Graphics) {
                    rects.push(UITools.getScreenBounds(child));
                }
            });

            return rects.reduce(UITools.unionRects, { x: 0, y: 0, width: 0, height: 0 });
        }

        /**
         * Get the position of an object, adjusted to remain inside a container
         */
        static positionInside(obj: IBounded, container: IBounded): [number, number] {
            let y = obj.y;
            if (y + obj.height > container.height) {
                y = container.height - obj.height;
            }
            if (y < container.y) {
                y = container.y;
            }

            let x = obj.x;
            if (x + obj.width > container.width) {
                x = container.width - obj.width;
            }
            if (x < container.x) {
                x = container.x;
            }

            return [x, y];
        }

        /**
         * Reposition an object to remain inside a container
         */
        static keepInside(obj: Phaser.Button | Phaser.Sprite | Phaser.Image | Phaser.Group | Phaser.Graphics, rect: IBounded) {
            let objbounds = obj.getBounds();
            let [x, y] = UITools.positionInside({ x: obj.x, y: obj.y, width: objbounds.width, height: objbounds.height }, rect);

            if (x != obj.x || y != obj.y) {
                obj.position.set(x, y);
            }
        }

        /**
         * Compare two rectangles
         */
        static compareRects(rct1: IBounded, rct2: IBounded) {
            return rct1.x == rct2.x && rct1.y == rct2.y && rct1.width == rct2.width && rct1.height == rct2.height;
        }

        /**
         * Returns the bounding rectangle containing two other rectangles
         */
        static unionRects(rct1: IBounded, rct2: IBounded): IBounded {
            let result: IBounded;
            if (rct1.width == 0 || rct1.height == 0) {
                result = rct2;
            } else if (rct2.width == 0 || rct2.height == 0) {
                result = rct1;
            } else {
                let xmin = Math.min(rct1.x, rct2.x);
                let xmax = Math.max(rct1.x + rct1.width, rct2.x + rct2.width);
                let ymin = Math.min(rct1.y, rct2.y);
                let ymax = Math.max(rct1.y + rct1.height, rct2.y + rct2.height);

                result = { x: xmin, y: ymin, width: xmax - xmin, height: ymax - ymin };
            }

            if (result.width == 0 || result.height == 0) {
                return { x: 0, y: 0, width: 0, height: 0 };
            } else {
                return result;
            }
        }

        /**
         * Constraint an angle in radians the ]-pi;pi] range.
         */
        static normalizeAngle(angle: number): number {
            angle = angle % (2 * Math.PI);
            if (angle <= -Math.PI) {
                return angle + 2 * Math.PI;
            } else if (angle > Math.PI) {
                return angle - 2 * Math.PI;
            } else {
                return angle;
            }
        }

        /**
         * Evenly space identical items in a parent
         * 
         * Returns the relative position of item's center inside parent_width
         */
        static evenlySpace(parent_width: number, item_width: number, item_count: number): number[] {
            if (item_width * item_count <= parent_width) {
                let spacing = parent_width / item_count;
                return range(item_count).map(i => (i + 0.5) * spacing);
            } else {
                let breadth = parent_width - item_width;
                let spacing = breadth / (item_count - 1);
                return range(item_count).map(i => item_width / 2 + i * spacing);
            }
        }

        /**
         * Draw a background around a content
         */
        static drawBackground(content: Phaser.Group | Phaser.Text, background: Phaser.Graphics, border = 6): [number, number] {
            if (content.parent === background.parent) {
                let bounds = content.getLocalBounds();

                let x = bounds.x - border;
                let y = bounds.y - border;
                let width = bounds.width + 2 * border;
                let height = bounds.height + 2 * border;

                if (!(background.width && background.data.bg_bounds && UITools.compareRects(background.data.bg_bounds, bounds))) {
                    background.clear();
                    background.lineStyle(2, 0x404450);
                    background.beginFill(0x202225);
                    background.drawRect(x, y, width, height);
                    background.endFill();

                    background.data.bg_bounds = copy(bounds);
                }

                return [width, height];
            } else {
                console.error("Cannot draw background with different parents", content, background);
                return [0, 0];
            }
        }
    }
}
