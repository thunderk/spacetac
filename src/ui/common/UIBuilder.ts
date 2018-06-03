/**
 * Main way to create UI components
 */
module TK.SpaceTac.UI {
    export type UIBuilderParent = UIImage | UIContainer

    export type ShaderValue = number | { x: number, y: number }
    export type UIOnOffCallback = (on: boolean) => boolean

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
        view: BaseView
        private game: MainUI
        private parent: UIBuilderParent
        private text_style: UITextStyleI

        constructor(view: BaseView, parent: UIBuilderParent | string = "base", text_style: UITextStyleI = new UITextStyle) {
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
        in(container: UIBuilderParent | string, body?: (builder: UIBuilder) => void): UIBuilder {
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
            if (this.parent instanceof UIImage) {
                console.error("Cannot clear an image parent, use groups instead");
            } else {
                this.parent.removeAll(true);
            }
        }

        /**
         * Internal method to add to the parent
         */
        private add(child: UIText | UIImage | UIButton | UIContainer | UIGraphics): void {
            if (this.parent instanceof UIImage) {
                let gparent = this.parent.parentContainer;
                if (gparent) {
                    let x = this.parent.x + child.x;
                    let y = this.parent.y + child.y;
                    child.setPosition(x, y);
                    gparent.add(child);
                } else {
                    throw new Error("no parent container");
                }
            } else {
                this.parent.add(child);
            }
        }

        /**
         * Add a container of other components
         */
        container(name: string, x = 0, y = 0, visible = true): UIContainer {
            let result = new UIContainer(this.view, x, y);
            result.setName(name);
            result.setVisible(visible);
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
            let result = new UIText(this.view, x, y, content, {
                fill: style.color,
                align: style.center ? "center" : "left"
            });
            result.setFont(`${style.bold ? "bold " : ""}${style.size}pt SpaceTac`);
            result.setOrigin(style.center ? 0.5 : 0, style.vcenter ? 0.5 : 0);
            if (style.width) {
                result.setWordWrapWidth(style.width);
            }
            if (style.shadow) {
                result.setShadow(3, 4, "rgba(0,0,0,0.6)", 3, true, true);
            }
            if (style.stroke_width && style.stroke_color) {
                result.setStroke(style.stroke_color, style.stroke_width);
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
            let result = new UIImage(this.view, x, y, info.key, info.frame);
            result.name = name;
            if (!centered) {
                result.setOrigin(0);
            }
            this.add(result);
            return result;
        }

        /**
         * Add a hoverable and/or clickable button
         * 
         * If an image with "-hover" suffix is found in atlases, it will be used as hover mask (added as button child)
         */
        button(name: string, x = 0, y = 0, onclick?: Function, tooltip?: TooltipFiller, onoffcallback?: UIOnOffCallback, options: UIButtonOptions = {}): UIButton {
            options.text_style = merge(this.text_style, options.text_style || {});
            let result = new UIButton(this.view, name, x, y, onclick, tooltip, onoffcallback, options);
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
         * Add a graphics (for drawing)
         */
        graphics(name: string, x = 0, y = 0, visible = true): UIGraphics {
            let result = new UIGraphics(this.view, name, visible, x, y);
            this.add(result);
            return result;
        }

        /**
         * Emit a bunch of particles
         */
        particles(config: ParticlesConfig): void {
            this.view.particles.emit(config, this.parent instanceof UIContainer ? this.parent : undefined);
        }

        /**
         * Animation to await something
         */
        awaiter(x = 0, y = 0, visible = true, scale = 1): UIAwaiter {
            let result = new UIAwaiter(this.view, x, y, visible);
            result.setScale(scale);
            this.add(result);
            return result;
        }

        /**
         * Change the content of an component
         * 
         * If the component is a text, its content will be changed.
         * If the component is an image, its texture will be changed.
         */
        change(component: UIImage | UIText, content: string): void {
            // TODO Should be moved custom UIImage and UIText classes
            if (component instanceof UIText) {
                component.setText(content);
            } else {
                let info = this.view.getImageInfo(content);
                component.setName(content);
                component.setTexture(info.key, info.frame);
            }
        }

        /**
         * Evenly distribute the children of this builder along an axis
         */
        distribute(along: "x" | "y", start: number, end: number): void {
            if (!(this.parent instanceof UIContainer)) {
                throw new Error("UIBuilder.distribute only works on groups");
            }
            let children = this.parent.list;

            let sizes = children.map(child => {
                if (UITools.isSpatial(child)) {
                    return UITools.getBounds(child)[along == "x" ? "width" : "height"];
                } else {
                    return 0;
                }
            });
            let spacing = ((end - start) - sum(sizes)) / (sizes.length + 1);
            let offset = start;
            children.forEach((child, idx) => {
                offset += spacing;
                if (UITools.isSpatial(child)) {
                    child[along] = Math.round(offset);
                }
                offset += sizes[idx];
            });
        }
    }
}
