module TK.SpaceTac.UI {
    export type UIInternalComponent = Phaser.Group | Phaser.Image | Phaser.Button | Phaser.Sprite | Phaser.Graphics;

    export type UIImageInfo = string | { key: string, frame?: number, frame1?: number, frame2?: number };
    export type UITextInfo = { content: string, color: string, size: number, bold?: boolean };

    function imageFromInfo(game: Phaser.Game, info: UIImageInfo): Phaser.Image {
        if (typeof info === "string") {
            info = { key: info };
        }
        let image = new Phaser.Image(game, 0, 0, info.key, info.frame);
        image.anchor.set(0.5, 0.5);
        return image;
    }

    function textFromInfo(game: Phaser.Game, info: UITextInfo): Phaser.Text {
        let style = { font: `${info.bold ? "bold " : ""}${info.size}pt SpaceTac`, fill: info.color };
        let text = new Phaser.Text(game, 0, 0, info.content, style);
        return text;
    }

    function autoFromInfo(game: Phaser.Game, info: UIImageInfo | UITextInfo): Phaser.Text | Phaser.Image {
        if (info.hasOwnProperty("content")) {
            return textFromInfo(game, <UITextInfo>info);
        } else {
            return imageFromInfo(game, <UIImageInfo>info);
        }
    }

    /**
     * Base class for UI components
     */
    export class UIComponent {
        private background: Phaser.Image | Phaser.Graphics | null
        protected readonly view: BaseView
        protected readonly parent: UIComponent | null
        private readonly container: Phaser.Group
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

            this.background = this.addInternalChild(new Phaser.Graphics(this.game, 0, 0));
            if (border_width) {
                this.background.lineStyle(border_width, border);
            }
            this.background.beginFill(fill, alpha);
            this.background.drawRect(0, 0, this.width, this.height);
            this.background.endFill();

            if (mouse_capture) {
                this.background.inputEnabled = true;
                this.background.input.useHandCursor = true;
                this.background.events.onInputUp.add(() => mouse_capture());
            }
        }

        /**
         * Move the a parent's layer
         */
        moveToLayer(layer: Phaser.Group) {
            layer.add(this.container);
        }

        /**
         * Destroy the component
         */
        destroy(children = true) {
            this.container.destroy(children);
        }

        /**
         * Create the internal phaser node
         */
        protected createInternalNode(): Phaser.Group {
            return new Phaser.Group(this.view.game, undefined, classname(this));
        }

        /**
         * Add an other internal component as child
         */
        protected addInternalChild<T extends UIInternalComponent>(child: T): T {
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
            let offset = this.background ? 1 : 0;
            while (this.container.children.length > offset) {
                this.container.remove(this.container.children[offset], true);
            }
        }

        /**
         * Set the standard sounds on a button
         */
        static setButtonSound(button: Phaser.Button): void {
            button.setDownSound(new Phaser.Sound(button.game, "ui-button-down"));
            button.setUpSound(new Phaser.Sound(button.game, "ui-button-up"));
        }

        /**
         * Add a button in the component, positioning its center.
         * 
         * DEPRECATED - Use UIBuilder directly
         */
        addButton(x: number, y: number, on_click: Function, background: string, tooltip = ""): Phaser.Button {
            let result = this.builder.button(background, x, y, on_click, tooltip);
            result.anchor.set(0.5);
            return result;
        }

        /**
         * Add a static text.
         * 
         * DEPRECATED - Use UIBuilder directly
         */
        addText(x: number, y: number, content: string, color = "#ffffff", size = 16, bold = false, center = true, width = 0, vcenter = center): Phaser.Text {
            return this.builder.text(content, x, y, { color: color, size: size, bold: bold, center: center, width: width, vcenter: vcenter });
        }

        /**
         * Add a static image, positioning its center.
         * 
         * DEPRECATED - Use addImage instead
         */
        addImageF(x: number, y: number, key: string, frame = 0, scale = 1): void {
            let image = new Phaser.Image(this.container.game, x, y, key, frame);
            image.anchor.set(0.5, 0.5);
            image.scale.set(scale);
            this.addInternalChild(image);
        }

        /**
         * Add a static image, from atlases, positioning its center.
         * 
         * DEPRECATED - Use UIBuilder directly
         */
        addImage(x: number, y: number, name: string, scale = 1): Phaser.Image {
            let result = this.builder.image(name, x, y);
            result.anchor.set(0.5);
            result.scale.set(scale);
            return result;
        }

        /**
         * Add an animated loader (to indicate a waiting for something).
         */
        addLoader(x: number, y: number, scale = 1): Phaser.Image {
            let image = new Phaser.Image(this.game, x, y, "common-waiting");
            image.anchor.set(0.5, 0.5);
            image.scale.set(scale);
            image.animations.add("loop").play(3, true);
            this.addInternalChild(image);
            return image;
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
