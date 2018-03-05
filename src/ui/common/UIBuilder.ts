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
     * Button options
     */
    export type UIButtonOptions = {
        // Name of the hover picture (by default, the button name, with "-hover" appended)
        hover_name?: string

        // Name of the "on" picture (by default, the button name, with "-on" appended)
        on_name?: string
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
            destroyChildren(this.parent);
        }

        /**
         * Internal method to add to the parent
         */
        private add(child: UIText | UIImage | UIButton | UIContainer): void {
            if (this.parent instanceof Phaser.Group) {
                this.parent.add(child);
            } else if (this.parent instanceof Phaser.Button) {
                // Protect the "on" and "hover" layers
                let layer = first(this.parent.children, child => child instanceof Phaser.Image && (child.name == "*on*" || child.name == "*hover*"));
                if (layer) {
                    this.parent.addChildAt(child, this.parent.getChildIndex(layer));
                } else {
                    this.parent.addChild(child);
                }
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
                result.setShadow(3, 4, "rgba(0,0,0,0.6)", 3);
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
         * Add a hoverable and/or clickable button
         * 
         * If an image with "-hover" suffix is found in atlases, it will be used as hover mask (added as button child)
         */
        button(name: string, x = 0, y = 0, onclick?: Function, tooltip?: TooltipFiller, onoffcallback?: UIOnOffCallback, options: UIButtonOptions = {}): UIButton {
            let info = this.view.getImageInfo(name);
            let result = new Phaser.Button(this.game, x, y, info.key, undefined, null, info.frame, info.frame);
            result.name = name;

            let clickable = bool(onclick);
            result.input.useHandCursor = clickable;
            if (clickable) {
                UIComponent.setButtonSound(result);
            }

            let onstatus = false;

            if (clickable || tooltip || onoffcallback) {
                // On mask
                let on_mask: Phaser.Image | null = null;
                if (onoffcallback) {
                    let on_info = this.view.getImageInfo(options.on_name || (name + "-on"));
                    if (on_info.exists) {
                        on_mask = new Phaser.Image(this.game, 0, 0, on_info.key, on_info.frame);
                        on_mask.name = "*on*";
                        on_mask.visible = false;
                        result.addChild(on_mask);
                    }
                    // TODO Find a better way to handle this (extend Button ?)
                    result.data.onoffcallback = (on: boolean): boolean => {
                        onstatus = onoffcallback(on);
                        if (on_mask) {
                            on_mask.anchor.set(result.anchor.x, result.anchor.y);
                            this.view.animations.setVisible(on_mask, onstatus, 100);
                        }
                        return onstatus;
                    }
                }

                // Hover mask
                let hover_info = this.view.getImageInfo(options.hover_name || (name + "-hover"));
                let hover_mask: Phaser.Image | null = null;
                if (hover_info.exists) {
                    hover_mask = new Phaser.Image(this.game, 0, 0, hover_info.key, hover_info.frame);
                    hover_mask.name = "*hover*";
                    hover_mask.visible = false;
                    result.addChild(hover_mask);
                }

                this.view.inputs.setHoverClick(result,
                    () => {
                        if (tooltip) {
                            this.view.tooltip.show(result, tooltip);
                        }
                        if (hover_mask) {
                            hover_mask.anchor.set(result.anchor.x, result.anchor.y);
                            this.view.animations.show(hover_mask, 100);
                        }
                    },
                    () => {
                        if (tooltip) {
                            this.view.tooltip.hide();
                        }
                        if (hover_mask) {
                            this.view.animations.hide(hover_mask, 100)
                        }
                    },
                    () => {
                        if (onclick) {
                            onclick();
                        } else if (onoffcallback) {
                            this.switch(result, !onstatus);
                        }
                    }, 100);
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

        /**
         * Change the status on/off on a button
         * 
         * Return the final effective status
         */
        switch(button: UIButton, on: boolean): boolean {
            if (button.data.onoffcallback) {
                return button.data.onoffcallback(on);
            } else {
                return false;
            }
        }

        /**
         * Select a single button inside the container, toggle its "on" status, and toggle all other button to "off"
         * 
         * This is the equivalent of radio buttons
         */
        select(button: UIButton): void {
            this.parent.children.forEach(child => {
                if (child instanceof Phaser.Button && child.data.onoffcallback && child !== button) {
                    child.data.onoffcallback(false);
                }
            });
            this.switch(button, true);
        }

        /**
         * Evenly distribute the children of this builder along an axis
         */
        distribute(along: "x" | "y", start: number, end: number): void {
            let sizes = this.parent.children.map(child => {
                if (child instanceof Phaser.Image || child instanceof Phaser.Sprite || child instanceof Phaser.Group) {
                    return UITools.getScreenBounds(child)[along == "x" ? "width" : "height"];
                } else {
                    return 0;
                }
            });
            let spacing = ((end - start) - sum(sizes)) / (sizes.length + 1);
            let offset = start;
            this.parent.children.forEach((child, idx) => {
                offset += spacing;
                child[along] = Math.round(offset);
                offset += sizes[idx];
            });
        }
    }
}
