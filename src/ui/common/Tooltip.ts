module TS.SpaceTac.UI {

    class TooltipContainer extends Phaser.Group {
        view: BaseView
        background: Phaser.Graphics
        content: Phaser.Group
        anchorpoint: [number, number] = [0, 0]

        constructor(view: BaseView) {
            super(view.game);

            this.view = view;
            this.visible = false;

            this.background = new Phaser.Graphics(this.game);
            this.add(this.background);

            this.content = new Phaser.Group(this.game);
            this.add(this.content);

            this.view.tooltip_layer.add(this);
        }

        show(x: number, y: number) {
            this.anchorpoint = [x, y];
            this.visible = true;
        }

        update() {
            if (this.visible) {
                let bounds = this.content.getBounds();
                let width = bounds.width + 20;
                let height = bounds.height + 20;

                if (this.background.width != width || this.background.height != height) {
                    this.background.clear();
                    this.background.beginFill(0x202225, 0.9);
                    this.background.drawRect(-10, -10, width, height);
                    this.background.endFill();
                }

                let [x, y] = UITools.positionInside({ x: this.anchorpoint[0], y: this.anchorpoint[1], width: width, height: height }, { x: 0, y: 0, width: this.view.getWidth(), height: this.view.getHeight() });
                if (x != this.x || y != this.y) {
                    this.position.set(x, y);
                }
            }
        }

        hide() {
            this.content.removeAll();
            this.visible = false;
        }
    }

    /**
     * Functions used to fill a tooltip content
     */
    export class TooltipFiller {
        private container: TooltipContainer;

        constructor(container: TooltipContainer) {
            this.container = container;
        }

        /**
         * Add an image to the content
         */
        addImage(x: number, y: number, key: string, scale = 1) {
            let image = new Phaser.Image(this.container.game, x, y, key);
            image.scale.set(scale);
            this.container.content.add(image);
        }

        /**
         * Add a text to the content
         */
        addText(x: number, y: number, content: string, color = "#ffffff", size = 16, center = false, bold = false) {
            let style = { font: `${bold ? "bold " : ""}${size}pt Arial`, fill: color, align: center ? "center" : "left" };
            let text = new Phaser.Text(this.container.game, x, y, content, style);
            this.container.content.add(text);
        }
    }

    /**
     * Tooltip system, to display information on hover
     */
    export class Tooltip {
        protected view: BaseView;
        protected container: TooltipContainer;

        constructor(view: BaseView) {
            this.view = view;
            this.container = new TooltipContainer(view);
        }

        get ui(): MainUI {
            return this.view.gameui;
        }

        /**
         * Get a tooltip filler
         */
        getFiller(): TooltipFiller {
            return new TooltipFiller(this.container);
        }

        /**
         * Bind to an UI component
         * 
         * When the component is hovered, the function is called to allow filling the tooltip container
         */
        bind(obj: Phaser.Button, func: (filler: TooltipFiller) => boolean): void {
            UITools.setHoverClick(obj,
                // enter
                () => {
                    this.hide();
                    if (func(this.getFiller())) {
                        let bounds = obj.getBounds();
                        this.container.show(bounds.x + bounds.width + 4, bounds.y + bounds.height + 4);
                    }
                },
                // leave
                () => this.hide(),
                // click
                () => this.hide()
            );
            obj.onInputDown.add(() => this.hide());
        }

        /**
         * Bind to an UI component to display a dynamic text
         */
        bindDynamicText(obj: Phaser.Button, text_getter: () => string): void {
            this.bind(obj, filler => {
                let content = text_getter();
                if (content) {
                    filler.addText(0, 0, content, "#cccccc", 20, false, true);
                    return true;
                } else {
                    return false;
                }
            });
        }

        /**
         * Bind to an UI component to display a simple text
         */
        bindStaticText(obj: Phaser.Button, text: string): void {
            this.bindDynamicText(obj, () => text);
        }

        /**
         * Hide the current tooltip
         */
        hide(): void {
            this.container.hide();
        }
    }
}