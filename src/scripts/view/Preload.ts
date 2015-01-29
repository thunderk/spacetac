module SpaceTac.View {
    "use strict";

    export class Preload extends Phaser.State {
        private preloadBar: Phaser.Sprite;

        preload() {
            // Add preload sprite
            this.preloadBar = this.add.sprite(0, 0, "preload-bar");
            this.preloadBar.position.set((1280 - this.preloadBar.width) / 2, (720 - this.preloadBar.height) / 2);
            this.load.setPreloadSprite(this.preloadBar);

            // Load assets
            this.load.image("battle-shiplist-own", "assets/images/battle/shiplist-own.png");
            this.load.image("battle-shiplist-enemy", "assets/images/battle/shiplist-enemy.png");
            this.load.image("battle-arena-background", "assets/images/battle/arena/background.png");
            this.load.image("battle-actionbar", "assets/images/battle/actionbar.png");
            this.load.image("battle-action-inactive", "assets/images/battle/action-inactive.png");
            this.load.image("battle-action-active", "assets/images/battle/action-active.png");
            this.load.image("battle-actionpointsempty", "assets/images/battle/actionpointsempty.png");
            this.load.image("battle-actionpointsfull", "assets/images/battle/actionpointsfull.png");
            this.load.image("battle-arena-shipspritehover", "assets/images/battle/arena/shipspritehover.png");
            this.load.image("battle-arena-shipspriteplaying", "assets/images/battle/arena/shipspriteplaying.png");
            this.load.image("battle-ship-card", "assets/images/battle/ship-card.png");
            this.load.image("battle-arena-ship01", "assets/images/battle/arena/ship01.png");
            this.load.image("common-standard-bar-background", "assets/images/common/standard-bar-background.png");
            this.load.image("common-standard-bar-foreground", "assets/images/common/standard-bar-foreground.png");
        }

        create() {
            this.game.state.start("main");
        }
    }
}
