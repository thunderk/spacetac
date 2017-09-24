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

            this.message = view.game.add.image(view.getMidWidth(), view.getMidHeight(), "battle-splash-base", 0);
            this.message.anchor.set(0.5);
            this.message.visible = false;

            this.player1 = view.game.add.image(0, -70, "battle-splash-base", 2);
            this.player1.anchor.set(0.5);
            this.player1.visible = false;
            this.message.addChild(this.player1);

            let player1_name = view.game.add.text(-240, 22, fleet1.player.name, { font: `bold 22pt SpaceTac`, fill: "#154d13" });
            player1_name.anchor.set(0.5);
            player1_name.angle = -48;
            this.player1.addChild(player1_name);

            fleet1.ships.forEach((ship, index) => {
                let ship_card = view.game.add.image(-100 + index * 96, -26, "battle-splash-shipcard", 0);
                ship_card.anchor.set(0.5);
                let ship_portrait = view.newImage(`ship-${ship.model.code}-portrait`);
                ship_portrait.scale.set(0.3);
                ship_portrait.anchor.set(0.5);
                ship_card.addChild(ship_portrait);
                this.player1.addChild(ship_card);
            });

            this.player2 = view.game.add.image(0, 70, "battle-splash-base", 2);
            this.player2.anchor.set(0.5);
            this.player2.angle = 180;
            this.player2.visible = false;
            this.message.addChild(this.player2);

            let player2_name = view.game.add.text(-240, 22, fleet2.player.name, { font: `bold 22pt SpaceTac`, fill: "#651713" });
            player2_name.anchor.set(0.5);
            player2_name.angle = -228;
            this.player2.addChild(player2_name);

            fleet2.ships.forEach((ship, index) => {
                let ship_card = view.game.add.image(-104 + index * 96, -32, "battle-splash-shipcard", 1);
                ship_card.anchor.set(0.5);
                let ship_portrait = view.newImage(`ship-${ship.model.code}-portrait`);
                ship_portrait.scale.set(0.3);
                ship_portrait.anchor.set(0.5);
                ship_card.angle = 180;
                ship_card.addChild(ship_portrait);
                this.player2.addChild(ship_card);
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

            this.view.timer.schedule(600, () => this.message.frame = 1);
            this.view.timer.schedule(630, () => this.message.frame = 0);
            this.view.timer.schedule(640, () => this.message.frame = 1);
            this.view.timer.schedule(655, () => this.message.frame = 0);
            this.view.timer.schedule(680, () => this.message.frame = 1);

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
