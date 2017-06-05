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
            this.loadImage("menu/title.png");
            this.loadImage("menu/button.png");
            this.loadImage("menu/button-hover.png");
            this.loadImage("menu/button-fullscreen.png");
            this.loadImage("menu/load-bg.png");
            this.loadSheet("common/particles.png", 32);
            this.loadImage("common/transparent.png");
            this.loadImage("common/debug.png");
            this.loadImage("common/waiting.png");
            this.loadImage("common/arrow.png");
            this.loadImage("common/button-ok.png");
            this.loadImage("common/button-cancel.png");
            this.loadImage("battle/shiplist/background.png");
            this.loadImage("battle/shiplist/item-background.png");
            this.loadImage("battle/shiplist/damage.png");
            this.loadImage("battle/shiplist/hover.png");
            this.loadImage("battle/shiplist/info-button.png");
            this.loadImage("battle/background.jpg");
            this.loadImage("battle/actionbar.png");
            this.loadImage("battle/action-inactive.png");
            this.loadImage("battle/action-active.png");
            this.loadImage("battle/action-selected.png");
            this.loadImage("battle/action-cooldown.png");
            this.loadImage("battle/power-available.png");
            this.loadImage("battle/power-using.png");
            this.loadImage("battle/power-used.png");
            this.loadImage("battle/arena/background.png");
            this.loadImage("battle/arena/ap-indicator.png");
            this.loadImage("battle/arena/ship-normal-enemy.png");
            this.loadImage("battle/arena/ship-normal-own.png");
            this.loadImage("battle/arena/ship-playing-enemy.png");
            this.loadImage("battle/arena/ship-playing-own.png");
            this.loadImage("battle/arena/ship-hull-base.png");
            this.loadImage("battle/arena/ship-hull-full.png");
            this.loadImage("battle/arena/ship-shield-base.png");
            this.loadImage("battle/arena/ship-shield-full.png");
            this.loadImage("battle/arena/ship-effect-good.png");
            this.loadImage("battle/arena/ship-effect-bad.png");
            this.loadImage("battle/arena/ship-power.png");
            this.loadImage("battle/arena/stasis.png");
            this.loadImage("battle/arena/target.png");
            this.loadImage("battle/arena/blast.png");
            this.loadImage("battle/actions/move.png");
            this.loadImage("battle/actions/endturn.png");
            this.loadImage("battle/weapon/default.png");
            this.loadImage("battle/weapon/bullets.png");
            this.loadImage("battle/weapon/hot.png");
            this.loadImage("battle/weapon/shield-impact.png");
            this.loadImage("battle/weapon/blast.png");
            this.loadImage("battle/outcome/dialog.png");
            this.loadImage("battle/outcome/title-victory.png");
            this.loadImage("battle/outcome/title-defeat.png");
            this.loadImage("battle/outcome/button-menu.png");
            this.loadImage("battle/outcome/button-map.png");
            this.loadImage("battle/outcome/button-revert.png");
            this.loadImage("battle/outcome/button-loot.png");
            this.loadImage("map/starsystem-background.png");
            this.loadImage("map/current-location.png");
            this.loadImage("map/name.png");
            this.loadImage("map/orbit.png");
            this.loadImage("map/boundaries.png");
            this.loadSheet("map/button-zoom.png", 115, 191);
            this.loadImage("map/button-jump.png");
            this.loadImage("map/location-star.png");
            this.loadImage("map/location-planet.png");
            this.loadImage("map/location-warp.png");
            this.loadSheet("map/status.png", 32, 32);
            this.loadImage("character/sheet.png");
            this.loadImage("character/close.png");
            this.loadImage("character/ship.png");
            this.loadImage("character/ship-selected.png");
            this.loadImage("character/skill-upgrade.png");
            this.loadImage("character/cargo-slot.png");
            this.loadImage("character/equipment-slot.png");
            this.loadImage("character/slot-power.png");
            this.loadImage("character/slot-hull.png");
            this.loadImage("character/slot-shield.png");
            this.loadImage("character/slot-engine.png");
            this.loadImage("character/slot-weapon.png");
            this.loadImage("character/upgrade-available.png");
            this.loadImage("character/price-tag.png");
            this.loadImage("character/experience.png");
            this.loadImage("equipment/ironhull.png");
            this.loadImage("equipment/forcefield.png");
            this.loadImage("equipment/nuclearreactor.png");
            this.loadImage("equipment/rocketengine.png");
            this.loadImage("equipment/gatlinggun.png");
            this.loadImage("equipment/powerdepleter.png");
            this.loadImage("equipment/submunitionmissile.png");
            this.loadImage("equipment/repairdrone.png");
            this.loadImage("equipment/shieldtransfer.png");

            // Load ships
            this.loadShip("avenger");
            this.loadShip("breeze");
            this.loadShip("commodore");
            this.loadShip("creeper");
            this.loadShip("falcon");
            this.loadShip("flea");
            this.loadShip("jumper");
            this.loadShip("rhino");
            this.loadShip("scout");
            this.loadShip("tomahawk");
            this.loadShip("trapper");
            this.loadShip("whirlwind");
            this.loadShip("xander");

            // Load sounds
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

        /**
         * Load a ship's sprite and portrait
         */
        loadShip(name: string) {
            this.loadImage("ship/" + name + "/sprite.png");
            this.loadImage("ship/" + name + "/portrait.png");
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
