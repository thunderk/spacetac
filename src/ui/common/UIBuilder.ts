/**
 * Main way to create UI components
 */
module TK.SpaceTac.UI {
    export type UIText = Phaser.Text
    export type UIImage = Phaser.Image
    export type UIButton = Phaser.Button
    export type UIContainer = Phaser.Group | Phaser.Image

    /**
     * Text style interface
     */
    export interface UITextStyleI {
        size?: number
        color?: string
        shadow?: boolean
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
                // TODO get or create
                this.parent = view.addLayer(parent);
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
        in(container: UIContainer | string): UIBuilder {
            return new UIBuilder(this.view, container, this.text_style);
        }

        /**
         * Create a new UIBuilder with style changes
         */
        styled(changes: UITextStyleI): UIBuilder {
            return new UIBuilder(this.view, this.parent, merge(this.text_style, changes));
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
        group(name: string, x = 0, y = 0): UIContainer {
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
            this.add(result);
            return result;
        }

        /**
         * Add an image
         */
        image(name: string | string[], x = 0, y = 0): UIImage {
            if (typeof name != "string") {
                name = this.view.getFirstImage(...name);
            }

            let info = this.view.getImageInfo(name);
            let result = this.game.add.image(x, y, info.key, info.frame);
            result.name = name;
            this.add(result);
            return result;
        }

        /**
         * Add a clickable button
         */
        button(name: string, x = 0, y = 0, onclick?: Function): UIButton {
            let info = this.view.getImageInfo(name);
            let result = new Phaser.Button(this.game, x, y, info.key, onclick || nop, null, info.frame, info.frame);
            result.name = name;
            let clickable = bool(onclick);
            result.input.useHandCursor = clickable;
            if (clickable) {
                UIComponent.setButtonSound(result);
            }
            this.add(result);
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
