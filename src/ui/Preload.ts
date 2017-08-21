/// <reference path="BaseView.ts"/>

module TS.SpaceTac.UI {
    export class Preload extends BaseView {
        private preloadBar: Phaser.Image;

        preload() {
            // Add preload sprite
            let bg = this.add.image(678, 426, "preload-background");
            this.preloadBar = this.add.image(684, bg.y + 166, "preload-bar");
            this.load.setPreloadSprite(this.preloadBar);

            // Load images
            this.loadSheet("common/particles.png", 32);
            this.loadImage("common/transparent.png");
            this.loadImage("common/debug.png");
            this.loadImage("common/waiting.png");
            this.loadImage("common/arrow.png");
            this.loadImage("common/button-ok.png");
            this.loadImage("common/button-cancel.png");
            this.loadImage("common/dialog.png");
            this.loadSheet("common/dialog-textbutton.png", 316, 59);
            this.loadSheet("common/dialog-close.png", 92, 82);
            this.loadImage("menu/title.png");
            this.loadImage("menu/button.png");
            this.loadImage("menu/button-hover.png");
            this.loadImage("menu/load-bg.png");
            this.loadImage("options/background.png");
            this.loadSheet("options/button.png", 497, 134);
            this.loadSheet("options/options.png", 128, 128);
            this.loadSheet("options/toggle.png", 149, 149);
            this.loadSheet("battle/splash/base.png", 853, 210);
            this.loadSheet("battle/splash/shipcard.png", 99, 114);
            this.loadImage("battle/background.jpg");
            this.loadImage("battle/actionbar/background.png");
            this.loadSheet("battle/actionbar/icon.png", 88, 88);
            this.loadSheet("battle/actionbar/power.png", 58, 21);
            this.loadSheet("battle/actionbar/button-menu.png", 79, 132);
            this.loadImage("battle/arena/background.png");
            this.loadImage("battle/arena/blast.png");
            this.loadSheet("battle/arena/gauges.png", 19, 93);
            this.loadSheet("battle/arena/small-indicators.png", 10, 10);
            this.loadSheet("battle/arena/indicators.png", 64, 64);
            this.loadSheet("battle/arena/ship-frames.png", 70, 70);
            this.loadImage("battle/shiplist/background.png");
            this.loadImage("battle/shiplist/item-background.png");
            this.loadImage("battle/shiplist/damage.png");
            this.loadImage("battle/shiplist/hover.png");
            this.loadImage("battle/shiplist/info-button.png");
            this.loadImage("map/starsystem-background.png");
            this.loadImage("map/current-location.png");
            this.loadImage("map/name.png");
            this.loadImage("map/subname.png");
            this.loadSheet("map/action.png", 323, 192);
            this.loadImage("map/orbit.png");
            this.loadImage("map/boundaries.png");
            this.loadSheet("map/buttons.png", 115, 191);
            this.loadImage("map/location-star.png");
            this.loadImage("map/location-planet.png");
            this.loadImage("map/location-warp.png");
            this.loadSheet("map/status.png", 32);
            this.loadSheet("map/missions.png", 70);
            this.loadSheet("map/mission-action.png", 192, 56);
            this.loadImage("character/sheet.png");
            this.loadImage("character/close.png");
            this.loadImage("character/ship.png");
            this.loadImage("character/ship-selected.png");
            this.loadImage("character/skill-upgrade.png");
            this.loadImage("character/cargo-slot.png");
            this.loadImage("character/equipment-slot.png");
            this.loadSheet("character/slots.png", 52);
            this.loadImage("character/upgrade-available.png");
            this.loadImage("character/price-tag.png");
            this.loadImage("character/experience.png");

            // Load image atlases
            // TODO automatic range
            range(3).forEach(i => this.loadAtlas(i + 1));

            // Load sounds
            this.loadSound("ui/button-down.wav");
            this.loadSound("ui/button-up.wav");
            this.loadSound("ui/button-click.wav");
            this.loadSound("ui/dialog-open.wav");
            this.loadSound("ui/dialog-close.wav");
            this.loadSound("ui/drag.wav");
            this.loadSound("ui/drop.wav");
            this.loadSound("battle/ship-change.wav");
            this.loadSound("battle/weapon-bullets.wav");
            this.loadSound("battle/weapon-missile-launch.wav");
            this.loadSound("battle/weapon-missile-explosion.wav");
            this.loadSound("battle/drone-deploy.wav");
            this.loadSound("battle/drone-destroy.wav");
            this.loadSound("battle/drone-activate.wav");

            // Load musics
            this.loadSound("music/division.mp3");
            this.loadSound("music/mechanolith.mp3");
            this.loadSound("music/spring-thaw.mp3");
            this.loadSound("music/supernatural.mp3");

            this.load.start();
        }

        create() {
            this.game.state.start("mainmenu");
        }

        static getKey(path: string): string {
            return path.replace(/\//g, "-").replace(/\.[a-z0-9]+$/, '');
        }

        loadAtlas(index: number) {
            this.load.atlasJSONHash(`atlas-${index}`, `assets/atlas-${index}.png`, `assets/atlas-${index}.json`);
        }

        loadSheet(path: string, frame_width: number, frame_height = frame_width) {
            this.load.spritesheet(Preload.getKey(path), "assets/images/" + path, frame_width, frame_height);
        }

        loadImage(path: string) {
            this.load.image(Preload.getKey(path), "assets/images/" + path);
        }

        loadSound(path: string) {
            this.load.audio(Preload.getKey(path), "assets/sounds/" + path);
        }
    }
}
