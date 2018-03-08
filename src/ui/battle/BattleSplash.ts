module TK.SpaceTac.UI {
    /**
     * Splash screen at the start of battle
     */
    export class BattleSplash {
        private view: BaseView
        private message: Phaser.Image
        private player1: Phaser.Image
        private player2: Phaser.Image

        constructor(view: BaseView, fleet1: Fleet, fleet2: Fleet) {
            this.view = view;

            let builder = new UIBuilder(view);

            this.message = builder.image("battle-splash-message-off", view.getMidWidth(), view.getMidHeight(), true);
            this.message.visible = false;

            this.player1 = builder.in(this.message).image("battle-splash-moving-part", 0, -70, true);
            this.player1.visible = false;

            let player1_name = builder.in(this.player1).text(fleet1.name, -240, 22, { size: 22, bold: true, color: "#154d13" });
            player1_name.angle = -48;

            fleet1.ships.forEach((ship, index) => {
                let ship_card = builder.in(this.player1).image("battle-splash-shipcard-top", -100 + index * 96, -26, true);
                let ship_portrait = builder.in(ship_card).image(`ship-${ship.model.code}-portrait`, -2, 2, true);
                ship_portrait.scale.set(0.3);
            });

            this.player2 = builder.in(this.message).image("battle-splash-moving-part", 0, 70, true);
            this.player2.angle = 180;
            this.player2.visible = false;

            let player2_name = builder.in(this.player2).text(fleet2.name, -240, 22, { size: 22, bold: true, color: "#651713" });
            player2_name.angle = -228;

            fleet2.ships.forEach((ship, index) => {
                let ship_card = builder.in(this.player2).image("battle-splash-shipcard-top", -104 + index * 96, -32, true);
                ship_card.angle = 180;
                let ship_portrait = builder.in(ship_card).image(`ship-${ship.model.code}-portrait`, -2, -12, true);
                ship_portrait.scale.set(0.3);
            });
        }

        /**
         * Add the splash to a view layer
         */
        moveToLayer(layer: Phaser.Group): void {
            layer.add(this.message);
        }

        /**
         * Start the animation
         */
        async start(): Promise<void> {
            let anims = this.view.animations;
            this.message.visible = true;
            this.message.scale.set(0.8);

            await anims.addAnimation(this.message.scale, { x: 1, y: 1 }, 300, Phaser.Easing.Bounce.Out);

            let builder = new UIBuilder(this.view);
            this.view.timer.schedule(600, () => builder.change(this.message, "battle-splash-message-on"));
            this.view.timer.schedule(630, () => builder.change(this.message, "battle-splash-message-off"));
            this.view.timer.schedule(640, () => builder.change(this.message, "battle-splash-message-on"));
            this.view.timer.schedule(655, () => builder.change(this.message, "battle-splash-message-off"));
            this.view.timer.schedule(680, () => builder.change(this.message, "battle-splash-message-on"));

            this.player1.x = -2000;
            this.player1.visible = true;
            this.player2.x = 2000;
            this.player2.visible = true;
            anims.addAnimation(this.player2, { x: 129 }, 600, Phaser.Easing.Bounce.Out, 400);
            await anims.addAnimation(this.player1, { x: -133 }, 600, Phaser.Easing.Bounce.Out, 400);

            await anims.addAnimation(this.message, { alpha: 0 }, 500, Phaser.Easing.Linear.None, 1500);

            this.message.destroy(true);
        }
    }
}
