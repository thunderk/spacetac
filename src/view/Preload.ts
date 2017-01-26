/// <reference path="BaseView.ts"/>

module SpaceTac.View {
    export class Preload extends BaseView {
        private preloadBar: Phaser.Image;

        preload() {
            // Add preload sprite
            let bg = this.add.image(678, 426, "preload-background");
            this.preloadBar = this.add.image(684, bg.y + 166, "preload-bar");
            this.load.setPreloadSprite(this.preloadBar);

            // Load images
            this.loadImage("menu/title.png");
            this.loadImage("menu/button.png");
            this.loadImage("menu/button-hover.png");
            this.loadImage("menu/star.png");
            this.loadImage("battle/waiting.png");
            this.loadImage("battle/shiplist-background.png");
            this.loadImage("battle/shiplist-own.png");
            this.loadImage("battle/shiplist-enemy.png");
            this.loadImage("battle/shiplist-damage.png");
            this.loadImage("battle/shiplist-effect-good.png");
            this.loadImage("battle/shiplist-effect-bad.png");
            this.loadImage("battle/shiplist-energy-empty.png");
            this.loadImage("battle/shiplist-energy-full.png");
            this.loadImage("battle/shiplist-hull-empty.png");
            this.loadImage("battle/shiplist-hull-full.png");
            this.loadImage("battle/shiplist-shield-empty.png");
            this.loadImage("battle/shiplist-shield-full.png");
            this.loadImage("battle/background.jpg");
            this.loadImage("battle/arena/background.png");
            this.loadImage("battle/arena/ap-indicator.png");
            this.loadImage("battle/actionbar.png");
            this.loadImage("battle/action-inactive.png");
            this.loadImage("battle/action-active.png");
            this.loadImage("battle/action-selected.png");
            this.loadImage("battle/action-tooltip.png");
            this.loadImage("battle/actionpointsnone.png");
            this.loadImage("battle/actionpointsempty.png");
            this.loadImage("battle/actionpointsfull.png");
            this.loadImage("battle/actionpointspart.png");
            this.loadImage("battle/ship-tooltip-own.png");
            this.loadImage("battle/ship-tooltip-enemy.png");
            this.loadImage("battle/ship-tooltip-effect.png");
            this.loadImage("battle/arena/ship-hover.png");
            this.loadImage("battle/arena/ship-normal-enemy.png");
            this.loadImage("battle/arena/ship-normal-own.png");
            this.loadImage("battle/arena/ship-playing-enemy.png");
            this.loadImage("battle/arena/ship-playing-own.png");
            this.loadImage("battle/actions/move.png");
            this.loadImage("battle/actions/endturn.png");
            this.loadImage("battle/actions/fire-gatlinggun.png");
            this.loadImage("battle/actions/fire-energydepleter.png");
            this.loadImage("battle/actions/fire-submunitionmissile.png");
            this.loadImage("battle/weapon/bullet.png");
            this.loadImage("common/standard-bar-background.png");
            this.loadImage("common/standard-bar-foreground.png");
            this.loadImage("map/starsystem-background.png");
            this.loadImage("map/zoom-in.png");
            this.loadImage("map/zoom-out.png");
            this.loadImage("map/star.png");
            this.loadImage("map/planet.png");

            // Load ships
            this.loadShip("scout");
            this.loadShip("whirlwind");

            // Load sounds
            this.loadSound("battle/ship-change.wav");
            this.loadSound("battle/weapon-bullets.wav");

            // Load musics
            this.loadSound("music/walking-along.mp3");
            this.loadSound("music/full-on.mp3");
            this.load.start();
        }

        create() {
            this.game.state.start("mainmenu");
        }

        private loadShip(name: string) {
            this.loadImage("ship/" + name + "/sprite.png");
            this.loadImage("ship/" + name + "/portrait.png");
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
