module TS.SpaceTac.UI {
    export type UIInternalComponent = Phaser.Group | Phaser.Image | Phaser.Button | Phaser.Sprite;

    /**
     * Base class for UI components
     */
    export class UIComponent {
        protected readonly view: BaseView;
        protected readonly parent: UIComponent | null;
        private readonly container: UIInternalComponent;
        protected readonly width: number;
        protected readonly height: number;

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

            if (background_key) {
                this.addInternalChild(new Phaser.Image(this.view.game, 0, 0, background_key));
            }
        }

        get game(): MainUI {
            return this.view.gameui;
        }

        /**
         * Move the a parent's layer
         */
        moveToLayer(layer: Phaser.Group) {
            layer.add(this.container);
        }

        /**
         * Create the internal phaser node
         */
        protected createInternalNode(): UIInternalComponent {
            return new Phaser.Group(this.view.game, undefined, classname(this));
        }

        /**
         * Add an other internal component as child
         */
        protected addInternalChild(child: UIInternalComponent): void {
            if (this.container instanceof Phaser.Group) {
                this.container.add(child);
            } else {
                this.container.addChild(child);
            }
        }

        /**
         * Set the component's visibility, with optional transition (in milliseconds)
         */
        setVisible(visible: boolean, transition = 0): void {
            if (transition > 0) {
                this.view.animations.setVisible(this.container, visible, transition);
            } else {
                this.container.visible = visible;
            }
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
            this.container.position.set(x, y);
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
                this.container.position.set(Math.round(rx), Math.round(ry));
            } else {
                this.container.position.set(rx, ry);
            }
        }

        /**
         * Clear from all added content.
         */
        clearContent(): void {
            while (this.container.children.length > 0) {
                this.container.removeChildAt(0);
            }
        }

        /**
         * Add a button in the component, positioning its center.
         */
        addButton(x: number, y: number, on_click: Function, background: string, frame_normal = 0, frame_hover = frame_normal, tooltip = "", angle = 0) {
            let button = new Phaser.Button(this.view.game, x, y, background, on_click, undefined, frame_hover, frame_normal);
            button.anchor.set(0.5, 0.5);
            button.angle = angle;
            if (tooltip) {
                this.view.tooltip.bindStaticText(button, tooltip);
            }
            this.addInternalChild(button);
        }

        /**
         * Add a static text.
         */
        addText(x: number, y: number, content: string, color = "#ffffff", size = 16, bold = false, center = true, width = 0): void {
            let style = { font: `${bold ? "bold " : ""}${size}pt Arial`, fill: color, align: center ? "center" : "left" };
            let text = new Phaser.Text(this.view.game, x, y, content, style);
            if (center) {
                text.anchor.set(0.5, 0.5);
            }
            if (width) {
                text.wordWrap = true;
                text.wordWrapWidth = width;
            }
            this.addInternalChild(text);
        }

        /**
         * Add a static image, positioning its center.
         */
        addImage(x: number, y: number, key: string, scale = 1): void {
            let image = new Phaser.Image(this.container.game, x, y, key);
            image.anchor.set(0.5, 0.5);
            image.scale.set(scale);
            this.addInternalChild(image);
        }

        /**
         * Set the keyboard focus on this component.
         */
        setKeyboardFocus(on_key: (key: string) => void) {
            this.view.inputs.grabKeyboard(this, on_key);
            // TODO release on destroy
        }
    }
}
