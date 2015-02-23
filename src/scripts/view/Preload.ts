module SpaceTac.View {
    "use strict";

    export class Preload extends Phaser.State {
        private preloadBar: Phaser.Sprite;

        preload() {
            // Add preload sprite
            this.preloadBar = this.add.sprite(0, 0, "preload-bar");
            this.preloadBar.position.set((1280 - this.preloadBar.width) / 2, (720 - this.preloadBar.height) / 2);
            this.load.setPreloadSprite(this.preloadBar);

            // Load images
            this.loadImage("battle/waiting.png");
            this.loadImage("battle/shiplist-base.png");
            this.loadImage("battle/shiplist-normal.png");
            this.loadImage("battle/shiplist-playing.png");
            this.loadImage("battle/shiplist-own.png");
            this.loadImage("battle/shiplist-enemy.png");
            this.loadImage("battle/background.jpg");
            this.loadImage("battle/arena/background.png");
            this.loadImage("battle/actionbar.png");
            this.loadImage("battle/action-inactive.png");
            this.loadImage("battle/action-active.png");
            this.loadImage("battle/actionpointsempty.png");
            this.loadImage("battle/actionpointsfull.png");
            this.loadImage("battle/arena/shipspritehover.png");
            this.loadImage("battle/arena/shipspriteplaying.png");
            this.loadImage("battle/ship-card.png");
            this.loadImage("battle/actions/move.png");
            this.loadImage("battle/actions/endturn.png");
            this.loadImage("battle/actions/fire-gatlinggun.png");
            this.loadImage("battle/weapon/bullet.png");
            this.loadImage("ship/scout/sprite.png");
            this.loadImage("ship/scout/portrait.png");
            this.loadImage("common/standard-bar-background.png");
            this.loadImage("common/standard-bar-foreground.png");

            // Load sounds
            this.loadSound("battle/ship-change.wav");
            this.loadSound("battle/weapon-bullets.wav");
        }

        create() {
            this.game.state.start("main");
        }

        private loadImage(path: string) {
            this.load.image(path.replace(/\//g, "-").replace(".png", "").replace(".jpg", ""), "assets/images/" + path);
        }

        private loadSound(path: string) {
            var key = path.replace(/\//g, "-").replace(".wav", "");
            this.load.audio(key, "assets/sounds/" + path);
        }
    }
}
