module TS.SpaceTac.UI {
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
                this.background = this.addInternalChild(new Phaser.Image(this.view.game, 0, 0, background_key));
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
         */
        addButton(x: number, y: number, on_click: Function, background: string, frame_normal = 0, frame_hover = 1, tooltip = "", angle = 0) {
            let button = new Phaser.Button(this.view.game, x, y, background, on_click, undefined, frame_hover, frame_normal);
            UIComponent.setButtonSound(button);
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
        addText(x: number, y: number, content: string, color = "#ffffff", size = 16, bold = false, center = true, width = 0, vcenter = center): void {
            let style = { font: `${bold ? "bold " : ""}${size}pt SpaceTac`, fill: color, align: center ? "center" : "left" };
            let text = new Phaser.Text(this.view.game, x, y, content, style);
            text.anchor.set(center ? 0.5 : 0, vcenter ? 0.5 : 0);
            if (width) {
                text.wordWrap = true;
                text.wordWrapWidth = width;
            }
            this.addInternalChild(text);
        }

        /**
         * Add a static image, positioning its center.
         */
        addImage(x: number, y: number, key: string, frame = 0, scale = 1): void {
            let image = new Phaser.Image(this.container.game, x, y, key, frame);
            image.anchor.set(0.5, 0.5);
            image.scale.set(scale);
            this.addInternalChild(image);
        }

        /**
         * Add a static image, from atlases, positioning its center.
         */
        addImageA(x: number, y: number, name: string, scale = 1): void {
            let info = this.view.getImageInfo(name);
            let image = new Phaser.Image(this.container.game, x, y, info.key, info.frame);
            image.anchor.set(0.5, 0.5);
            image.scale.set(scale);
            this.addInternalChild(image);
        }

        /**
         * Add a 2-states toggle button.
         * 
         * *background* should have three frames (toggled, untoggled and hovered).
         * 
         * Returns a function to force the state of the button.
         */
        addToggleButton(x: number, y: number, background: UIImageInfo, content: UIImageInfo | UITextInfo, on_change: (toggled: boolean) => void): (toggled: boolean) => void {
            let toggled = false;
            let toggle = (state: boolean, broadcast = false) => {
                toggled = state;
                if (typeof background !== "string") {
                    image.frame = (toggled ? background.frame : background.frame1) || background.frame || 0;
                }
                contentobj.alpha = toggled ? 1 : 0.5;
                if (broadcast) {
                    on_change(toggled);
                }
            };

            let button = new Phaser.Button(this.container.game, x, y, "common-transparent", () => toggle(!toggled, true));
            UIComponent.setButtonSound(button);

            let image = imageFromInfo(this.game, background);
            let contentobj = autoFromInfo(this.game, content);

            button.addChild(image);
            button.addChild(contentobj);
            this.addInternalChild(button);

            toggle(toggled);

            return toggle;
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
