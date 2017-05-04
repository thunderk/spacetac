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
     * Tooltip system, to display information on hover
     */
    export class Tooltip {
        private view: BaseView;
        private container: TooltipContainer;

        constructor(view: BaseView) {
            this.view = view;
            this.container = new TooltipContainer(view);
        }

        /**
         * Bind to an UI component
         * 
         * When the component is hovered, the function is called to allow filling the tooltip container
         */
        bind(obj: Phaser.Button, func: (container: Phaser.Group) => boolean): void {
            UITools.setHoverClick(obj,
                // enter
                () => {
                    this.hide();
                    if (func(this.container.content)) {
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
            this.bind(obj, container => {
                container.add(new Phaser.Text(container.game, 0, 0, text_getter(), { font: "bold 20pt Arial", fill: "#cccccc" }));
                return true;
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