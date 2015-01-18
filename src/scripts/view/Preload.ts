module SpaceTac.View {
    "use strict";

    export class Preload extends Phaser.State {
        private preloadBar: Phaser.Sprite;

        preload() {
            // Add preload sprite
            this.preloadBar = this.add.sprite(290, 290, "preload-bar");
            this.load.setPreloadSprite(this.preloadBar);

            // Load assets
            this.load.image("ui-shiplist-own", "assets/images/battle/shiplist-own.png");
            this.load.image("ui-shiplist-enemy", "assets/images/battle/shiplist-enemy.png");
            this.load.image("ui-arena-background", "assets/images/battle/arena-background.png");
            this.load.image("ui-battle-actionbar", "assets/images/ui/battle/actionbar.png");
            this.load.image("ui-ship-card", "assets/images/battle/ship-card.png");
            this.load.image("arena-ship", "assets/images/battle/ship01.png");
            this.load.image("ui-bar-standard-background", "assets/images/ui/bars/standard-background.png");
            this.load.image("ui-bar-standard-foreground", "assets/images/ui/bars/standard-foreground.png");
        }

        create() {
            this.game.state.start("main");
        }
    }
}
