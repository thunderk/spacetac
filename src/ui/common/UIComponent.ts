module TK.SpaceTac.UI {
    /**
     * Union of all UI components types
     */
    export type UIComponentT = UIContainer | UIImage | UIButton | UIGraphics | UIText;

    /**
     * Interface to add a component to a group
     */
    export interface UIGroupableI {
        addToGroup(group: UIContainer): void;
    }

    /**
     * Base class for UI components
     * 
     * DEPRECATED - Use UIBuilder instead
     */
    export class UIComponent {
        private background: UIImage | UIGraphics | null
        protected readonly view: BaseView
        protected readonly parent: UIComponent | null
        readonly container: UIContainer
        protected readonly width: number
        protected readonly height: number
        protected readonly builder: UIBuilder

        constructor(parent: BaseView | UIComponent, width: number, height: number, background_key: string | null = null) {
            this.width = width;
            this.height = height;

            if (parent instanceof UIComponent) {
                this.view = parent.view;
                this.parent = parent;
            } else {
                this.view = parent;
                this.parent = null;
            }

            this.container = this.createInternalNode();
            if (this.parent) {
                this.parent.addInternalChild(this.container);
            } else {
                this.view.add.existing(this.container);
            }
            this.container.setSize(width, height);
            this.builder = new UIBuilder(this.view, this.container);

            if (background_key) {
                this.background = this.builder.image(background_key, 0, 0, false);
            } else {
                this.background = null;
            }
        }

        get game(): MainUI {
            return this.view.gameui;
        }

        jasmineToString(): string {
            return this.toString();
        }

        toString(): string {
            return `<${classname(this)}>`;
        }

        /**
         * Draw a background
         */
        drawBackground(fill: number, border?: number, border_width = 0, alpha = 1, mouse_capture?: Function) {
            if (this.background) {
                this.background.destroy();
            }

            let rect = new Phaser.Geom.Rectangle(0, 0, this.width, this.height);
            this.background = this.addInternalChild(new UIGraphics(this.view, "background"));
            this.background.addRectangle(rect, fill, border_width, border, alpha);

            if (mouse_capture) {
                this.background.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
                this.background.on("pointerup", () => mouse_capture());
            }
        }

        /**
         * Move the a parent's layer
         */
        moveToLayer(layer: UIContainer) {
            layer.add(this.container);
        }

        /**
         * Destroy the component
         */
        destroy() {
            this.container.destroy();
        }

        /**
         * Create the internal phaser node
         */
        protected createInternalNode(): UIContainer {
            let result = new UIContainer(this.view);
            result.setName(classname(this));
            return result;
        }

        /**
         * Add an other internal component as child
         */
        protected addInternalChild<T extends UIComponentT>(child: T): T {
            this.container.add(child);
            return child;
        }

        /**
         * Set the component's visibility, with optional transition (in milliseconds)
         */
        setVisible(visible: boolean, transition = 0): void {
            this.view.animations.setVisible(this.container, visible, transition);
        }

        /**
         * Get the component's declared size
         */
        getSize(): [number, number] {
            return [this.width, this.height];
        }

        /**
         * Get the width and height of parent
         */
        getParentSize(): [number, number] {
            if (this.parent) {
                return this.parent.getSize();
            } else {
                return [this.view.getWidth(), this.view.getHeight()];
            }
        }

        /**
         * Return the component's position (either relative to its parent, or absolute in the view)
         */
        getPosition(relative = false): [number, number] {
            if (relative || !this.parent) {
                return [this.container.x, this.container.y];
            } else {
                let [px, py] = this.parent.getPosition();
                return [px + this.container.x, py + this.container.y];
            }
        }

        /**
         * Set the position in pixels.
         */
        setPosition(x: number, y: number): void {
            this.container.setPosition(x, y);
        }

        /**
         * Position the component inside the boundaries of its parent.
         * 
         * (0, 0) is the top-left anchoring, (1, 1) is the bottom-right one.
         * 
         * If *pixelsnap* is true, position will be rounded to pixel.
         */
        setPositionInsideParent(x: number, y: number, pixelsnap = true): void {
            let [pwidth, pheight] = this.getParentSize();
            let [width, height] = this.getSize();
            let rx = (pwidth - width) * x;
            let ry = (pheight - height) * y;
            if (pixelsnap) {
                this.container.setPosition(Math.round(rx), Math.round(ry));
            } else {
                this.container.setPosition(rx, ry);
            }
        }

        /**
         * Clear from all added content.
         */
        clearContent(): void {
            let offset = this.background ? 1 : 0;
            while (this.container.list.length > offset) {
                this.container.remove(this.container.list[offset], true);
            }
        }

        /**
         * Add a button in the component, positioning its center.
         * 
         * DEPRECATED - Use UIBuilder directly
         */
        addButton(x: number, y: number, on_click: Function, background: string, tooltip = ""): UIButton {
            return this.builder.button(background, x, y, on_click, tooltip, undefined, { center: true });
        }

        /**
         * Add a static text.
         * 
         * DEPRECATED - Use UIBuilder directly
         */
        addText(x: number, y: number, content: string, color = "#ffffff", size = 16, bold = false, center = true, width = 0, vcenter = center): UIText {
            return this.builder.text(content, x, y, { color: color, size: size, bold: bold, center: center, width: width, vcenter: vcenter });
        }

        /**
         * Add a static image, from atlases, positioning its center.
         * 
         * DEPRECATED - Use UIBuilder directly
         */
        addImage(x: number, y: number, name: string, scale = 1): UIImage {
            let result = this.builder.image(name, x, y, true);
            result.setScale(scale);
            return result;
        }
    }
}
