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
        private async components(builder: UIBuilder): Promise<void> {
            let base = builder.image("battle-splash-message-off", this.view.getMidWidth(), this.view.getMidHeight(), true);

            let message = builder.in(base).image("battle-splash-message-on", 0, 0, true);
            message.visible = false;

            let player1 = builder.in(base).image("battle-splash-moving-part", 0, -50, true);
            player1.visible = false;

            let player1_name = builder.in(player1).text(this.fleet1.name, -224, 0, { size: 22, bold: true, color: "#154d13" });
            player1_name.angle = -48;

            this.fleet1.ships.forEach((ship, index) => {
                let ship_card = builder.in(player1).image("battle-splash-ship-card", -86 + index * 96, -72, true);
                let ship_portrait = builder.in(ship_card).image(`ship-${ship.model.code}-portrait`, 0, 0, true);
                ship_portrait.scale.set(0.3);
            });

            let player2 = builder.in(base).image("battle-splash-moving-part", 0, 50, true);
            player2.angle = 180;
            player2.visible = false;

            let player2_name = builder.in(player2).text(this.fleet2.name, -224, 0, { size: 22, bold: true, color: "#651713" });
            player2_name.angle = -228;

            this.fleet2.ships.forEach((ship, index) => {
                let ship_card = builder.in(player2).image("battle-splash-ship-card", -86 + index * 96, -72, true);
                let ship_portrait = builder.in(ship_card).image(`ship-${ship.model.code}-portrait`, 0, 0, true);
                ship_portrait.angle = 180;
                ship_portrait.scale.set(0.3);
            });

            let anims = this.view.animations;

            base.visible = true;
            base.scale.set(0.8);

            await anims.addAnimation(base.scale, { x: 1, y: 1 }, 300, Phaser.Easing.Bounce.Out);

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
            anims.addAnimation(player2, { x: 147 }, 600, Phaser.Easing.Bounce.Out, 400);
            await anims.addAnimation(player1, { x: -150 }, 600, Phaser.Easing.Bounce.Out, 400);
        }

        /**
         * Create an overlay, returns when it is clicked
         */
        overlay(builder: UIBuilder): Promise<void> {
            return new Promise(resolve => {
                let overlay = builder.button("translucent-black", 0, 0, resolve);
                overlay.input.useHandCursor = true;
                overlay.scale.set(this.view.getWidth() / overlay.width, this.view.getHeight() / overlay.height);
            });
        }

        /**
         * Start the animation
         */
        start(parent?: UIGroup): Promise<void> {
            let builder = new UIBuilder(this.view, parent);
            let group = builder.group("splash");

            let overlay = this.overlay(builder.in(group));
            let components = this.components(builder.in(group));

            return Promise.all([
                overlay.then(() => {
                    group.visible = false;
                }),
                components
            ]).then(() => {
                group.destroy(true);
            });
        }
    }
}
