/**
 * Main way to create UI components
 */
module TK.SpaceTac.UI {
    export type UIText = Phaser.Text
    export type UIImage = Phaser.Image
    export type UIButton = Phaser.Button
    export type UIGroup = Phaser.Group
    export type UIContainer = Phaser.Group | Phaser.Image

    export type ShaderValue = number | { x: number, y: number }

    /**
     * Text style interface
     */
    export interface UITextStyleI {
        size?: number
        color?: string
        shadow?: boolean
        stroke_width?: number
        stroke_color?: string
        bold?: boolean
        center?: boolean
        vcenter?: boolean
        width?: number
    }

    /**
     * Text style
     */
    export class UITextStyle implements UITextStyleI {
        // Size in points
        size = 16

        // Font color
        color = "#ffffff"

        // Shadow under the text
        shadow = false

        // Stroke around the letters
        stroke_width = 0
        stroke_color = "#ffffff"

        // Bold text
        bold = false

        // Centering
        center = true
        vcenter = true

        // Word wrapping
        width = 0
    }

    /**
     * Main UI builder tool
     */
    export class UIBuilder {
        private view: BaseView
        private game: MainUI
        private parent: UIContainer
        private text_style: UITextStyle

        constructor(view: BaseView, parent: UIContainer | string = "base", text_style = new UITextStyle) {
            this.view = view;
            this.game = view.gameui;
            if (typeof parent == "string") {
                this.parent = view.getLayer(parent);
            } else {
                this.parent = parent;
            }
            this.text_style = text_style;
        }

        /**
         * Create a new UIBuilder inside a parent container, or a view layer
         * 
         * This new builder will inherit the style settings, and will create components in the specified parent
         */
        in(container: UIContainer | string, body?: (builder: UIBuilder) => void): UIBuilder {
            let result = new UIBuilder(this.view, container, this.text_style);
            if (body) {
                body(result);
            }
            return result;
        }

        /**
         * Create a new UIBuilder with style changes
         */
        styled(changes: UITextStyleI, body?: (builder: UIBuilder) => void): UIBuilder {
            let result = new UIBuilder(this.view, this.parent, merge(this.text_style, changes));
            if (body) {
                body(result);
            }
            return result;
        }

        /**
         * Clear the current container of all component
         */
        clear(): void {
            if (this.parent instanceof Phaser.Group) {
                this.parent.removeAll(true);
            } else {
                this.parent.children.forEach(child => (<any>child).destroy());
            }
        }

        /**
         * Internal method to add to the parent
         */
        private add(child: UIText | UIImage | UIButton | UIContainer): void {
            if (this.parent instanceof Phaser.Group) {
                this.parent.add(child);
            } else {
                this.parent.addChild(child);
            }
        }

        /**
         * Add a group of components
         */
        group(name: string, x = 0, y = 0): UIGroup {
            let result = new Phaser.Group(this.game, undefined, name);
            result.position.set(x, y);
            this.add(result);
            return result;
        }

        /**
         * Add a text
         * 
         * Anchor will be defined according to the style centering
         */
        text(content: string, x = 0, y = 0, style_changes: UITextStyleI = {}): UIText {
            let style = merge(this.text_style, style_changes);
            let result = new Phaser.Text(this.game, x, y, content, {
                font: `${style.bold ? "bold " : ""}${style.size}pt SpaceTac`,
                fill: style.color,
                align: style.center ? "center" : "left"
            });
            result.anchor.set(style.center ? 0.5 : 0, style.vcenter ? 0.5 : 0);
            if (style.width) {
                result.wordWrap = true;
                result.wordWrapWidth = style.width;
            }
            if (style.shadow) {
                result.setShadow(3, 4, "rgba(0,0,0,0.6)", 6);
            }
            if (style.stroke_width) {
                result.stroke = style.stroke_color;
                result.strokeThickness = style.stroke_width;
            }
            this.add(result);
            return result;
        }

        /**
         * Add an image
         */
        image(name: string | string[], x = 0, y = 0, centered = false): UIImage {
            if (typeof name != "string") {
                name = this.view.getFirstImage(...name);
            }

            let info = this.view.getImageInfo(name);
            let result = this.game.add.image(x, y, info.key, info.frame);
            result.name = name;
            if (centered) {
                result.anchor.set(0.5);
            }
            this.add(result);
            return result;
        }

        /**
         * Add a clickable button
         */
        button(name: string, x = 0, y = 0, onclick?: Function, tooltip?: string | (() => string)): UIButton {
            let info = this.view.getImageInfo(name);
            let result = new Phaser.Button(this.game, x, y, info.key, onclick || nop, null, info.frame, info.frame);
            result.name = name;
            let clickable = bool(onclick);
            result.input.useHandCursor = clickable;
            if (clickable) {
                UIComponent.setButtonSound(result);
            }
            if (tooltip) {
                if (typeof tooltip == "string") {
                    this.view.tooltip.bindStaticText(result, tooltip);
                } else {
                    this.view.tooltip.bindDynamicText(result, tooltip);
                }
            }
            this.add(result);
            return result;
        }

        /**
         * Add a value bar
         */
        valuebar(name: string, x = 0, y = 0, orientation = ValueBarOrientation.EAST): ValueBar {
            let result = new ValueBar(this.view, name, orientation, x, y);
            this.add(result.node);
            return result;
        }

        /**
         * Add a fragment shader area, with optional fallback image
         */
        shader(name: string, base: string | { width: number, height: number }, x = 0, y = 0, updater?: () => { [name: string]: ShaderValue }): UIImage {
            let source = this.game.cache.getShader(name);
            source = "" + source;
            let uniforms: any = {};
            if (updater) {
                iteritems(updater(), (key, value) => {
                    uniforms[key] = { type: (typeof value == "number") ? "1f" : "2f", value: value };
                });
            }
            let filter = new Phaser.Filter(this.game, uniforms, source);
            let result: Phaser.Image;
            if (typeof base == "string") {
                result = this.image(base, x, y);
                result.filters = [filter];
                filter.setResolution(result.width, result.height);
            } else {
                result = filter.addToWorld(x, y, base.width, base.height);
                this.add(result);
            }
            if (updater) {
                result.update = () => {
                    iteritems(updater(), (key, value) => filter.uniforms[key].value = value);
                    filter.update();
                }
            }
            filter.update();
            return result;
        }

        /**
         * Change the content of an component
         * 
         * If the component is a text, its content will be changed.
         * If the component is an image or button, its texture will be changed.
         */
        change(component: UIImage | UIButton | UIText, content: string): void {
            if (component instanceof Phaser.Text) {
                component.text = content;
            } else {
                let info = this.view.getImageInfo(content);
                component.name = content;
                if (component instanceof Phaser.Button) {
                    component.loadTexture(info.key);
                    component.setFrames(info.frame, info.frame);
                } else {
                    component.loadTexture(info.key, info.frame);
                }
            }
        }
    }
}
