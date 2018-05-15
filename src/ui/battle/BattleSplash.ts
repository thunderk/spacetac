module TK.SpaceTac.UI {
    /**
     * Splash screen at the start of battle
     */
    export class BattleSplash {
        constructor(private view: BaseView, private fleet1: Fleet, private fleet2: Fleet) {
        }

        /**
         * Create and animate splash component, returns when the animation is ended
         */
        private async components(builder: UIBuilder, container: UIContainer): Promise<void> {
            container.setScale(0.8);

            builder.image("battle-splash-message-off", 0, 0, true);

            let message = builder.image("battle-splash-message-on", 0, 0, true);
            message.visible = false;

            let player1 = builder.container("player1", 0, -50, false);
            builder.in(player1, builder => {
                builder.image("battle-splash-moving-part", 0, 0, true);

                let player1_name = builder.text(this.fleet1.name, -224, 0, { size: 22, bold: true, color: "#154d13" });
                player1_name.angle = -48;

                this.fleet1.ships.forEach((ship, index) => {
                    let ship_card = builder.image("battle-splash-ship-card", -86 + index * 96, -72, true);
                    let ship_portrait = builder.in(ship_card).image(`ship-${ship.model.code}-portrait`, 0, 0, true);
                    ship_portrait.setScale(0.3);
                });
            });

            let player2 = builder.container("player2", 0, 50, false);
            player2.setAngle(180);
            builder.in(player2, builder => {
                builder.image("battle-splash-moving-part", 0, 0, true);

                let player2_name = builder.text(this.fleet2.name, -224, 0, { size: 22, bold: true, color: "#651713" });
                player2_name.angle = -228;

                this.fleet2.ships.forEach((ship, index) => {
                    let ship_card = builder.image("battle-splash-ship-card", -86 + index * 96, -72, true);
                    let ship_portrait = builder.in(ship_card).image(`ship-${ship.model.code}-portrait`, 0, 0, true);
                    ship_portrait.setAngle(180);
                    ship_portrait.setScale(0.3);
                });
            });

            // Animations
            let anims = this.view.animations;

            await anims.addAnimation(container, { scaleX: 1, scaleY: 1 }, 300, 'Bounce.easeOut');

            this.view.timer.schedule(600, () => {
                message.visible = true;
                message.alpha = 0.7;
            });
            this.view.timer.schedule(660, () => message.alpha = 0.1);
            this.view.timer.schedule(680, () => message.alpha = 0.8);
            this.view.timer.schedule(710, () => message.alpha = 0.3);
            this.view.timer.schedule(760, () => message.alpha = 1);

            player1.x = -2000;
            player1.visible = true;
            player2.x = 2000;
            player2.visible = true;
            anims.addAnimation(player2, { x: 147 }, 600, 'Bounce.easeOut', 400);
            await anims.addAnimation(player1, { x: -150 }, 600, 'Bounce.easeOut', 400);
        }

        /**
         * Create an overlay, returns when it is clicked
         */
        overlay(builder: UIBuilder): Promise<UIButton> {
            return new Promise(resolve => {
                let overlay = builder.button("battle-overlay", this.view.getMidWidth(), this.view.getMidHeight(), () => resolve(overlay), undefined, undefined, { center: true });
                overlay.setScale(this.view.getWidth() / overlay.width, this.view.getHeight() / overlay.height);
            });
        }

        /**
         * Start the animation
         */
        start(parent?: UIContainer): Promise<void> {
            let builder = new UIBuilder(this.view, parent);
            let overlay = this.overlay(builder);

            let container = builder.container("splash", this.view.getMidWidth(), this.view.getMidHeight());
            let components = this.components(builder.in(container), container);

            return Promise.all([
                overlay.then(overlayobj => {
                    container.visible = false;
                    overlayobj.destroy();
                }),
                components
            ]).then(() => {
                container.destroy();
            });
        }
    }
}
