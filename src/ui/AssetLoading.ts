/// <reference path="BaseView.ts"/>

module TK.SpaceTac.UI {
    export enum AssetLoadingRange {
        NONE,
        MENU,
        BATTLE,
        CAMPAIGN
    }

    /**
     * Loader of all game assets
     */
    export class AssetLoading extends BaseView {
        private static loaded = AssetLoadingRange.NONE
        private required = AssetLoadingRange.NONE

        /**
         * Check if an asset range is loaded
         */
        static isRangeLoaded(game: Phaser.Game, range: AssetLoadingRange): boolean {
            if (range > AssetLoading.loaded) {
                return false;
            } else {
                return true;
            }
        }

        init(range = AssetLoadingRange.NONE) {
            super.init();

            this.required = range;
        }

        preload() {
            let text = this.add.text(this.getMidWidth(), 400, "... loading ...", { font: "bold 40pt SpaceTac", fill: "#529aee" });
            text.anchor.set(0.5);
            let bg = this.add.image(678, 570, "preload-background");
            let bar = this.add.image(678, 570, "preload-bar");
            this.load.setPreloadSprite(bar);

            if (this.required >= AssetLoadingRange.MENU && AssetLoading.loaded < AssetLoadingRange.MENU) {
                console.log("Loading menu assets");

                this.loadSound("ui/button-down.wav");
                this.loadSound("ui/button-up.wav");
                this.loadSound("ui/button-click.wav");
                this.loadSound("ui/dialog-open.wav");
                this.loadSound("ui/dialog-close.wav");

                this.loadSheet("options/options.png", 128, 128);

                this.loadSheet("common/particles.png", 32);
                this.loadImage("common/transparent.png");
                this.loadImage("common/debug.png");
                this.loadAnimation("common/waiting.png", 128, 128, 6);
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

                this.loadSound("music/supernatural.mp3");
            }

            if (this.required >= AssetLoadingRange.BATTLE && AssetLoading.loaded < AssetLoadingRange.BATTLE) {
                console.log("Loading battle assets");

                // TODO automatic range
                range(4).forEach(i => this.loadAtlas(i + 1));

                this.loadImage("options/background.png");
                this.loadSheet("options/button.png", 497, 134);
                this.loadSheet("options/toggle.png", 149, 149);

                this.loadSheet("battle/splash/base.png", 853, 210);
                this.loadSheet("battle/splash/shipcard.png", 99, 114);
                this.loadImage("battle/background.jpg");
                this.loadImage("battle/actionbar/background.png");
                this.loadImage("battle/actionbar/actions-background.png");
                this.loadSheet("battle/actionbar/button-menu.png", 79, 132);
                this.loadImage("battle/arena/background.png");
                this.loadImage("battle/shiplist/background.png");
                this.loadImage("battle/shiplist/item-background.png");
                this.loadImage("battle/shiplist/damage.png");
                this.loadImage("battle/shiplist/hover.png");
                this.loadImage("battle/shiplist/info-button.png");

                this.loadImage("character/sheet.png");

                this.loadSound("ui/drag.wav");
                this.loadSound("ui/drop.wav");

                this.loadSound("battle/ship-change.wav");
                this.loadSound("battle/weapon-laser.wav");
                this.loadSound("battle/weapon-bullets.wav");
                this.loadSound("battle/weapon-missile-launch.wav");
                this.loadSound("battle/weapon-missile-explosion.wav");
                this.loadSound("battle/drone-deploy.wav");
                this.loadSound("battle/drone-destroy.wav");
                this.loadSound("battle/drone-activate.wav");

                this.loadSound("music/mechanolith.mp3");
            }

            if (this.required >= AssetLoadingRange.CAMPAIGN && AssetLoading.loaded < AssetLoadingRange.CAMPAIGN) {
                console.log("Loading campaign assets");

                this.loadImage("map/starsystem-background.png");
                this.loadImage("map/name.png");
                this.loadImage("map/subname.png");
                this.loadSheet("map/action.png", 323, 192);
                this.loadImage("map/orbit.png");
                this.loadImage("map/boundaries.png");
                this.loadSheet("map/buttons.png", 115, 191);
                this.loadSheet("map/mission-action.png", 192, 56);

                this.loadSound("music/division.mp3");
                this.loadSound("music/spring-thaw.mp3");
            }

            this.load.start();
        }

        create() {
            super.create();

            AssetLoading.loaded = Math.max(AssetLoading.loaded, this.required);
            this.game.state.start("router");
        }

        static getKey(path: string): string {
            return path.replace(/\//g, "-").replace(/\.[a-z0-9]+$/, '');
        }

        loadAtlas(index: number) {
            this.load.atlasJSONHash(`atlas-${index}`, `assets/atlas-${index}.png`, `assets/atlas-${index}.json`);
        }

        loadSheet(path: string, frame_width: number, frame_height = frame_width) {
            this.load.spritesheet(AssetLoading.getKey(path), "assets/images/" + path, frame_width, frame_height);
        }

        loadAnimation(path: string, frame_width: number, frame_height = frame_width, count?: number) {
            this.load.spritesheet(AssetLoading.getKey(path), "assets/images/" + path, frame_width, frame_height, count);
        }

        loadImage(path: string) {
            this.load.image(AssetLoading.getKey(path), "assets/images/" + path);
        }

        loadSound(path: string) {
            this.load.audio(AssetLoading.getKey(path), "assets/sounds/" + path);
        }
    }
}
