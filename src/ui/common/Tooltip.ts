module TS.SpaceTac.UI {
    /**
     * Tooltip system, to display information on hover
     */
    export class Tooltip {
        private view: BaseView;
        private container: Phaser.Group;

        constructor(view: BaseView) {
            this.view = view;
            this.container = new Phaser.Group(view.game);
        }

        /**
         * Bind to an UI component
         * 
         * When the component is hovered, the function is called to allow filling the tooltip container
         */
        bind(obj: Phaser.Button, func: (container: Phaser.Group) => boolean): void {
            Tools.setHoverClick(obj,
                // enter
                () => {
                    this.container.visible = false;
                    if (func(this.container)) {
                        // position
                        let bounds = obj.getBounds();
                        this.container.position.set(bounds.x + bounds.width + 4, bounds.y + bounds.height + 4);

                        // add background
                        let ttbounds = this.container.getBounds();
                        let background = new Phaser.Graphics(this.container.game, 0, 0);
                        this.container.add(background);
                        background.beginFill(0x202225, 0.8);
                        background.drawRect(-10, -10, ttbounds.width + 20, ttbounds.height + 20);
                        background.endFill();
                        this.container.sendToBack(background);

                        // display
                        Tools.keepInside(this.container, { x: 0, y: 0, width: this.view.getWidth(), height: this.view.getHeight() });
                        this.container.visible = true;
                    }
                },
                // leave
                () => {
                    this.container.removeAll(true);
                    this.container.visible = false;
                },
                // click
                () => {
                    this.container.removeAll(true);
                    this.container.visible = false;
                }
            );
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
    }
}