module SpaceTac.View {
    "use strict";

    export class Preload extends Phaser.State {
        private preloadBar: Phaser.Sprite;

        preload() {
            // Add preload sprite
            this.preloadBar = this.add.sprite(0, 0, "preload-bar");
            this.preloadBar.position.set((this.stage.width - this.preloadBar.width) / 2, (this.stage.height - this.preloadBar.height) / 2);
            this.load.setPreloadSprite(this.preloadBar);

            // Load assets
            this.load.image("ui-shiplist-own", "assets/images/battle/shiplist-own.png");
            this.load.image("ui-shiplist-enemy", "assets/images/battle/shiplist-enemy.png");
            this.load.image("ui-arena-background", "assets/images/battle/arena-background.png");
            this.load.image("ui-battle-actionbar", "assets/images/ui/battle/actionbar.png");
            this.load.image("ui-battle-actionpointsempty", "assets/images/ui/battle/actionpointsempty.png");
            this.load.image("ui-battle-actionpointsfull", "assets/images/ui/battle/actionpointsfull.png");
            this.load.image("ui-battle-shipspritehover", "assets/images/ui/battle/shipspritehover.png");
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
