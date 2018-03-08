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
                this.load.pack("stage1", "assets/pack1.json");

                // TODO pack
                this.loadSheet("common/particles.png", 32);
                this.loadAnimation("common/waiting.png", 128, 128, 6);
            }

            if (this.required >= AssetLoadingRange.BATTLE && AssetLoading.loaded < AssetLoadingRange.BATTLE) {
                console.log("Loading battle assets");
                this.load.pack("stage2", "assets/pack2.json");
            }

            if (this.required >= AssetLoadingRange.CAMPAIGN && AssetLoading.loaded < AssetLoadingRange.CAMPAIGN) {
                console.log("Loading campaign assets");
                this.load.pack("stage3", "assets/pack3.json");
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

        loadSheet(path: string, frame_width: number, frame_height = frame_width) {
            this.load.spritesheet(AssetLoading.getKey(path), "images/" + path, frame_width, frame_height);
        }

        loadAnimation(path: string, frame_width: number, frame_height = frame_width, count?: number) {
            this.load.spritesheet(AssetLoading.getKey(path), "images/" + path, frame_width, frame_height, count);
        }
    }
}
