/// <reference path="BaseView.ts"/>

module SpaceTac.View {
    "use strict";

    export class Preload extends BaseView {
        private preloadBar: Phaser.Sprite;

        preload() {
            // Add preload sprite
            this.add.text(640, 340, "... Loading ...", {align: "center", font: "bold 20px Arial", fill: "#c0c0c0"})
                .anchor.set(0.5, 0.5);
            this.preloadBar = this.add.sprite(0, 0, "preload-bar");
            this.preloadBar.anchor.set(0.5, 0.5);
            this.preloadBar.position.set(this.getMidWidth(), this.getMidHeight());
            this.load.setPreloadSprite(this.preloadBar);

            // Load images
            this.loadImage("menu/button.png");
            this.loadImage("battle/waiting.png");
            this.loadImage("battle/shiplist-base.png");
            this.loadImage("battle/shiplist-own.png");
            this.loadImage("battle/shiplist-enemy.png");
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
            this.loadImage("battle/actions/move.png");
            this.loadImage("battle/actions/endturn.png");
            this.loadImage("battle/actions/fire-gatlinggun.png");
            this.loadImage("battle/weapon/bullet.png");
            this.loadImage("ship/scout/sprite.png");
            this.loadImage("ship/scout/portrait.png");
            this.loadImage("common/standard-bar-background.png");
            this.loadImage("common/standard-bar-foreground.png");
            this.loadImage("map/star-icon.png");
            this.loadImage("map/fleet-icon.png");
            this.loadImage("map/planet-icon.png");
            this.loadImage("map/warp-icon.png");
            this.loadImage("map/button-back.png");
            this.loadImage("map/button-jump.png");

            // Load sounds
            this.loadSound("battle/ship-change.wav");
            this.loadSound("battle/weapon-bullets.wav");

            // Load musics
            this.loadSound("music/walking-along.mp3");
            this.loadSound("music/full-on.mp3");
        }

        create() {
            this.game.state.start("mainmenu");
        }

        private loadImage(path: string) {
            this.load.image(path.replace(/\//g, "-").replace(".png", "").replace(".jpg", ""), "assets/images/" + path);
        }

        private loadSound(path: string) {
            var key = path.replace(/\//g, "-").replace(".wav", "").replace(".mp3", "");
            this.load.audio(key, "assets/sounds/" + path);
        }
    }
}
