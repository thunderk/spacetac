module SpaceTac.View {
    "use strict";

    export class Preload extends Phaser.State {
        private preloadBar: Phaser.Sprite;

        preload() {
            // Add preload sprite
            this.add.text(640, 340, "... Loading ...", {align: "center", font: "bold 20px Arial", fill: "#c0c0c0"})
                .anchor.set(0.5, 0.5);
            this.preloadBar = this.add.sprite(0, 0, "preload-bar");
            this.preloadBar.position.set((1280 - this.preloadBar.width) / 2, (720 - this.preloadBar.height) / 2);
            this.load.setPreloadSprite(this.preloadBar);

            // Load images
            this.loadImage("menu/button.png");
            this.loadImage("battle/waiting.png");
            this.loadImage("battle/shiplist-base.png");
            this.loadImage("battle/shiplist-normal.png");
            this.loadImage("battle/shiplist-playing.png");
            this.loadImage("battle/shiplist-own.png");
            this.loadImage("battle/shiplist-enemy.png");
            this.loadImage("battle/shiplist-ap-empty.png");
            this.loadImage("battle/shiplist-ap-full.png");
            this.loadImage("battle/shiplist-hull-empty.png");
            this.loadImage("battle/shiplist-hull-full.png");
            this.loadImage("battle/shiplist-shield-empty.png");
            this.loadImage("battle/shiplist-shield-full.png");
            this.loadImage("battle/background.jpg");
            this.loadImage("battle/arena/background.png");
            this.loadImage("battle/actionbar.png");
            this.loadImage("battle/actionbar-cancel.png");
            this.loadImage("battle/action-inactive.png");
            this.loadImage("battle/action-active.png");
            this.loadImage("battle/action-fading.png");
            this.loadImage("battle/action-tooltip.png");
            this.loadImage("battle/actionpointsempty.png");
            this.loadImage("battle/actionpointsfull.png");
            this.loadImage("battle/arena/shipspritehover.png");
            this.loadImage("battle/arena/shipspriteplaying.png");
            this.loadImage("battle/ship-card.png");
            this.loadImage("battle/shipcard-ap-empty.png");
            this.loadImage("battle/shipcard-ap-full.png");
            this.loadImage("battle/shipcard-hull-empty.png");
            this.loadImage("battle/shipcard-hull-full.png");
            this.loadImage("battle/shipcard-shield-empty.png");
            this.loadImage("battle/shipcard-shield-full.png");
            this.loadImage("battle/actions/move.png");
            this.loadImage("battle/actions/endturn.png");
            this.loadImage("battle/actions/fire-gatlinggun.png");
            this.loadImage("battle/weapon/bullet.png");
            this.loadImage("ship/scout/sprite.png");
            this.loadImage("ship/scout/portrait.png");
            this.loadImage("common/standard-bar-background.png");
            this.loadImage("common/standard-bar-foreground.png");
            this.loadImage("map/star-icon.png");

            // Load sounds
            this.loadSound("battle/ship-change.wav");
            this.loadSound("battle/weapon-bullets.wav");
        }

        create() {
            this.game.state.start("mainmenu");
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
