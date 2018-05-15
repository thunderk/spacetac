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
    export function destroyChildren(obj: UIContainer, start = 0, end = obj.length - 1) {
        obj.list.slice(start, end + 1).forEach(child => child.destroy());
    }

    /**
     * Common UI function to work around some Phaser limitations
     */
    export class UITools {
        /**
         * Check that a game object has transform and bounds available
         */
        static isSpatial(obj: any): obj is Phaser.GameObjects.Components.GetBounds & Phaser.GameObjects.Components.Transform {
            return obj instanceof UIImage || obj instanceof UIText || obj instanceof UIContainer;
        }

        /**
         * Get the bounding rectanle of a displayed object, in screen space
         */
        static getBounds(obj: UIContainer | (Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.GetBounds)): IBounded {
            let result: IBounded;

            if (obj instanceof UIContainer) {
                result = obj.getBounds();
            } else {
                result = obj.getBounds();
            }

            return result;
        }

        /**
         * Check if a game object is visible
         */
        static isVisible(obj: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Visible & Phaser.GameObjects.Components.Alpha): boolean {
            if (obj.visible && obj.alpha) {
                if (obj.parentContainer) {
                    return this.isVisible(obj.parentContainer);
                } else {
                    return true;
                }
            } else {
                return false;
            }
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
        static keepInside(obj: UIButton | UIImage | UIContainer, rect: IBounded) {
            let objbounds = UITools.getBounds(obj);
            let [x, y] = UITools.positionInside({ x: obj.x, y: obj.y, width: objbounds.width, height: objbounds.height }, rect);

            if (x != obj.x || y != obj.y) {
                obj.setPosition(x, y);
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
        static drawBackground(content: UIContainer | UIText, background: UIBackground, border = 6): [number, number] {
            if (content.parentContainer === background.parent) {
                background.adaptToContent(content);
                return [background.width, background.height];
            } else {
                console.error("Cannot draw background with different parents", content, background);
                return [0, 0];
            }
        }
    }
}
