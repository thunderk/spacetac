/// <reference path="UIContainer.ts" />

module TK.SpaceTac.UI {
    /**
     * Button options
     */
    export type UIButtonOptions = {
        // Centering
        center?: boolean

        // Name of the hover picture (by default, the button name, with "-hover" appended)
        hover_name?: string

        // Name of the "on" picture (by default, the button name, with "-on" appended)
        on_name?: string

        // Whether "hover" picture should stay near the button (otherwise will be on top)
        hover_bottom?: boolean

        // Whether "on" picture should stay near the button (otherwise will be on top)
        on_bottom?: boolean

        // Text content
        text?: string
        text_x?: number
        text_y?: number

        // Text content style override
        text_style?: UITextStyleI

        // Icon content
        icon?: string
        icon_x?: number
        icon_y?: number

        // Unicity setting to control other buttons in the same container
        unicity?: UIButtonUnicity
    }

    /**
     * When toggling a button status, this describes the behavior of other buttons in the same container
     */
    export enum UIButtonUnicity {
        // Do nothing to other buttons
        NONE = 0,
        // Shut down other buttons when one is toggled on
        EXCLUSIVE = 1,
        // Shut down other buttons when one is toggled on, but prevent to shut down the one currently on
        EXCLUSIVE_MIN = 2
    }

    /**
     * Button for UI, with support for hover, click, and on/off state
     */
    export class UIButton extends UIContainer {
        private base: UIImage
        private state_on = false
        readonly state_changer?: Function
        private hover_mask?: UIImage
        private hover_bottom = false
        private on_mask?: UIImage
        private on_bottom = false
        private constructed = false

        constructor(private view: BaseView, key: string, x = 0, y = 0, onclick?: Function, tooltip?: TooltipFiller, onoffcallback?: UIOnOffCallback, options: UIButtonOptions = {}) {
            super(view, x, y);
            this.setName(key);

            let builder = new UIBuilder(view, this, options.text_style);
            let base = builder.image(key, 0, 0, options.center);
            this.add(base);
            this.base = base;

            let clickable = bool(onclick || onoffcallback);
            let interactive = bool(clickable || tooltip);

            if (interactive) {
                this.setInteractive({
                    hitArea: new Phaser.Geom.Rectangle(
                        options.center ? 0 : base.width / 2,
                        options.center ? 0 : base.height / 2,
                        base.width,
                        base.height
                    ),
                    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                    useHandCursor: clickable
                });

                // On mask
                if (onoffcallback) {
                    let on_name = options.on_name || (key + "-on");
                    let on_info = view.getImageInfo(on_name);
                    if (on_info.exists) {
                        this.on_mask = builder.image(on_name, 0, 0, options.center);
                        this.on_mask.setVisible(false);
                        this.on_bottom = bool(options.on_bottom);
                    }
                    this.state_changer = (on: boolean): boolean => {
                        this.state_on = onoffcallback(on);
                        if (this.on_mask) {
                            view.animations.setVisible(this.on_mask, this.state_on, 100);
                        }
                        return this.state_on;
                    }
                }

                // Hover mask
                let hover_name = options.hover_name || (key + "-hover");
                let hover_info = view.getImageInfo(hover_name);
                if (hover_info.exists) {
                    this.hover_mask = builder.image(hover_name, 0, 0, options.center);
                    this.hover_mask.setVisible(false);
                    this.hover_bottom = bool(options.hover_bottom);
                    if (this.hover_bottom && this.on_mask && !this.on_bottom) {
                        this.moveDown(this.hover_mask);
                    }
                }

                view.inputs.setHoverClick(this,
                    () => {
                        if (tooltip) {
                            view.tooltip.show(this, tooltip);
                        }
                        if (this.hover_mask) {
                            view.animations.show(this.hover_mask, 100);
                        }
                    },
                    () => {
                        if (tooltip) {
                            view.tooltip.hide();
                        }
                        if (this.hover_mask) {
                            view.animations.hide(this.hover_mask, 100)
                        }
                    },
                    () => {
                        if (clickable && onclick) {
                            onclick();
                        } else if (onoffcallback) {
                            this.toggle(!this.state_on, options.unicity);
                        }
                    }, 100, undefined, clickable);
            }

            if (options.text) {
                builder.text(options.text, options.text_x || 0, options.text_y || 0, options.text_style);
            }

            if (options.icon) {
                builder.image(options.icon, options.icon_x || 0, options.icon_y || 0, options.center);
            }

            this.constructed = true;
        }

        add(child: UIImage | UIText): UIButton {
            if (this.constructed) {
                // Protect the "on" and "hover" layers
                let layer = first(this.list, child => (!this.hover_bottom && child == this.hover_mask) || (!this.on_bottom && child == this.on_mask));
                if (layer) {
                    super.addAt(child, this.getIndex(layer));
                } else {
                    super.add(child);
                }
            } else {
                super.add(child);
            }
            return this;
        }

        get width(): number {
            return this.base.width;
        }

        get height(): number {
            return this.base.height;
        }

        /**
         * Get the state on/off
         */
        getState(): boolean {
            return this.state_on;
        }

        /**
         * Change the base texture
         */
        setBaseImage(key: string): void {
            this.view.changeImage(this.base, key);
            this.setName(key);
        }

        /**
         * Select this button status
         * 
         * Returns the final state of this button
         */
        toggle(on?: boolean, unicity?: UIButtonUnicity): boolean {
            if (typeof on == "undefined") {
                on = !this.state_on;
            }

            if (on && unicity && this.parentContainer) {
                this.parentContainer.list.forEach(child => {
                    if (child instanceof UIButton && child != this) {
                        child.toggle(false);
                    }
                });
            }

            if (this.state_changer && (on || unicity != UIButtonUnicity.EXCLUSIVE_MIN) && on != this.state_on) {
                this.state_changer(on);
            }

            return this.state_on;
        }
    }
}
