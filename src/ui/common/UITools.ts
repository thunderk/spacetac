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
        static hovered: Phaser.Button | null = null;

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
         * Setup a hover/hold/click routine on an object
         * 
         * This should span the bridge between desktop and mobile targets.
         */
        static setHoverClick(obj: Phaser.Button, enter: Function, leave: Function, click: Function, hovertime = 300, holdtime = 600) {
            let holdstart = new Date();
            let enternext: Function | null = null;
            let entercalled = false;
            let cursorinside = false;
            let destroyed = false;

            obj.input.useHandCursor = true;

            let prevententer = () => {
                if (enternext != null) {
                    Timer.global.cancel(enternext);
                    enternext = null;
                    return true;
                } else {
                    return false;
                }
            };

            let effectiveenter = () => {
                if (!destroyed) {
                    enternext = null;
                    entercalled = true;
                    enter();
                }
            }

            let effectiveleave = () => {
                prevententer();
                if (entercalled) {
                    entercalled = false;
                    leave();
                }
            }

            if (obj.events) {
                obj.events.onDestroy.addOnce(() => {
                    destroyed = true;
                    effectiveleave();
                });
            }

            obj.onInputOver.add((_: any, pointer: Phaser.Pointer) => {
                if (destroyed) return;

                if (UITools.hovered) {
                    if (UITools.hovered === obj) {
                        return;
                    } else {
                        // Dirty fix - Force a "pointer out" on previously hovered, if it did not go out cleanly
                        (<any>UITools.hovered.input)._pointerOutHandler(pointer);
                    }
                }
                UITools.hovered = obj;

                if (obj.visible && obj.alpha) {
                    cursorinside = true;
                    enternext = Timer.global.schedule(hovertime, effectiveenter);
                }
            });

            obj.onInputOut.add(() => {
                if (destroyed) return;

                if (UITools.hovered === obj) {
                    UITools.hovered = null;
                }

                cursorinside = false;
                effectiveleave();
            });

            obj.onInputDown.add(() => {
                if (destroyed) return;

                if (obj.visible && obj.alpha) {
                    holdstart = new Date();
                    if (!cursorinside && !enternext) {
                        enternext = Timer.global.schedule(holdtime, effectiveenter);
                    }
                }
            });

            obj.onInputUp.add(() => {
                if (destroyed) return;

                if (!cursorinside) {
                    effectiveleave();
                }

                if (new Date().getTime() - holdstart.getTime() < holdtime) {
                    if (!cursorinside) {
                        effectiveenter();
                    }
                    click();
                    if (!cursorinside) {
                        effectiveleave();
                    }
                }
            });
        }

        // Constraint an angle in radians the ]-pi;pi] range.
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
         * Draw a background around a container
         * 
         * Content's top-left corner is supposed to be at (0,0)
         */
        static drawBackground(content: Phaser.Group | Phaser.Text, background: Phaser.Graphics, border = 6): [number, number] {
            let bounds = content.getBounds();
            let width = bounds.width + 2 * border;
            let height = bounds.height + 2 * border;

            if (background.width != width || background.height != height) {
                background.clear();
                background.lineStyle(2, 0x404450);
                background.beginFill(0x202225, 0.9);
                background.drawRect(-border, -border, width, height);
                background.endFill();
            }

            return [width, height];
        }
    }
}
