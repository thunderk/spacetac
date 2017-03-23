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
            this.loadImage("battle/power-available.png");
            this.loadImage("battle/power-using.png");
            this.loadImage("battle/power-used.png");
            this.loadImage("battle/ship-tooltip-own.png");
            this.loadImage("battle/ship-tooltip-enemy.png");
            this.loadImage("battle/ship-tooltip-effect.png");
            this.loadImage("battle/ship-tooltip-stasis.png");
            this.loadImage("battle/arena/ship-hover.png");
            this.loadImage("battle/arena/ship-normal-enemy.png");
            this.loadImage("battle/arena/ship-normal-own.png");
            this.loadImage("battle/arena/ship-playing-enemy.png");
            this.loadImage("battle/arena/ship-playing-own.png");
            this.loadImage("battle/arena/stasis.png");
            this.loadImage("battle/actions/move.png");
            this.loadImage("battle/actions/endturn.png");
            this.loadImage("battle/actions/fire-gatlinggun.png");
            this.loadImage("battle/actions/fire-powerdepleter.png");
            this.loadImage("battle/actions/fire-submunitionmissile.png");
            this.loadImage("battle/actions/deploy-repairdrone.png");
            this.loadImage("battle/weapon/default.png");
            this.loadImage("battle/weapon/bullets.png");
            this.loadImage("battle/weapon/hot.png");
            this.loadImage("battle/weapon/shield-impact.png");
            this.loadImage("battle/weapon/blast.png");
            this.loadImage("battle/attributes/power.png");
            this.loadImage("battle/attributes/powercapacity.png");
            this.loadImage("battle/attributes/hull.png");
            this.loadImage("battle/attributes/hullcapacity.png");
            this.loadImage("battle/attributes/shield.png");
            this.loadImage("battle/attributes/shieldcapacity.png");
            this.loadImage("battle/attributes/effect-increase.png");
            this.loadImage("battle/attributes/effect-decrease.png");
            this.loadImage("battle/attributes/effect-limit.png");
            this.loadImage("battle/outcome/dialog.png");
            this.loadImage("battle/outcome/title-victory.png");
            this.loadImage("battle/outcome/title-defeat.png");
            this.loadImage("battle/outcome/button-menu.png");
            this.loadImage("battle/outcome/button-map.png");
            this.loadImage("battle/outcome/button-revert.png");
            this.loadImage("battle/outcome/button-loot.png");
            this.loadImage("common/standard-bar-background.png");
            this.loadImage("common/standard-bar-foreground.png");
            this.loadImage("map/starsystem-background.png");
            this.loadImage("map/current-location.png");
            this.loadImage("map/zoom-in.png");
            this.loadImage("map/zoom-out.png");
            this.loadImage("map/button-jump.png");
            this.loadImage("map/location-star.png");
            this.loadImage("map/location-planet.png");
            this.loadImage("map/location-warp.png");
            this.loadImage("map/state-unknown.png");
            this.loadImage("map/state-enemy.png");
            this.loadImage("map/state-clear.png");
            this.loadImage("map/state-shop.png");
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
            this.loadImage("character/price-tag.png");
            this.loadImage("character/scroll.png");
            this.loadImage("equipment/ironhull.png");
            this.loadImage("equipment/basicforcefield.png");
            this.loadImage("equipment/basicpowercore.png");
            this.loadImage("equipment/conventionalengine.png");

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

        loadShip(name: string) {
            this.loadImage("ship/" + name + "/sprite.png");
            this.loadImage("ship/" + name + "/portrait.png");
        }

        loadImage(path: string) {
            this.load.image(path.replace(/\//g, "-").replace(".png", "").replace(".jpg", ""), "assets/images/" + path);
        }

        loadSound(path: string) {
            var key = path.replace(/\//g, "-").replace(".wav", "").replace(".mp3", "");
            this.load.audio(key, "assets/sounds/" + path);
        }
    }
}
