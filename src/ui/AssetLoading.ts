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

        init(data: any) {
            super.init(data);

            this.required = data ? data.range : AssetLoadingRange.NONE;
        }

        preload() {
            let bg = this.add.image(643, 435, "preload-background");
            bg.setOrigin(0);
            let bar = this.add.image(643, 435, "preload-bar");
            bar.setOrigin(0);
            let mask = this.make.graphics({ x: bar.x, y: bar.y, add: false });
            mask.fillStyle(0xffffff);
            bar.setMask(new Phaser.Display.Masks.GeometryMask(this, mask));

            this.load.on('progress', (value: number) => {
                mask.clear();
                mask.fillRect(0, 0, value * bar.width, bar.height);
            });

            let text = this.add.text(this.getMidWidth(), 466, "... Loading ...", { font: "normal 36pt SpaceTac", fill: "#dbeff9" });
            text.setOrigin(0.5);

            if (this.required >= AssetLoadingRange.MENU && AssetLoading.loaded < AssetLoadingRange.MENU) {
                console.log("Loading menu assets");
                this.load.pack("stage1", `assets/pack1.json?t=${Date.now()}`);

                // TODO pack
                this.loadSheet("common/particles.png", 32);
                this.loadAnimation("common/waiting.png", 128, 128, 6);
            }

            if (this.required >= AssetLoadingRange.BATTLE && AssetLoading.loaded < AssetLoadingRange.BATTLE) {
                console.log("Loading battle assets");
                this.load.pack("stage2", `assets/pack2.json?t=${Date.now()}`);
            }

            if (this.required >= AssetLoadingRange.CAMPAIGN && AssetLoading.loaded < AssetLoadingRange.CAMPAIGN) {
                console.log("Loading campaign assets");
                this.load.pack("stage3", `assets/pack3.json?t=${Date.now()}`);
            }
        }

        create() {
            super.create();

            AssetLoading.loaded = Math.max(AssetLoading.loaded, this.required);
            this.backToRouter();
        }

        static getKey(path: string): string {
            return path.replace(/\//g, "-").replace(/\.[a-z0-9]+$/, '');
        }

        loadSheet(path: string, frame_width: number, frame_height = frame_width) {
            this.load.spritesheet(AssetLoading.getKey(path), "images/" + path, {
                frameWidth: frame_width,
                frameHeight: frame_height,
            });
        }

        loadAnimation(path: string, frame_width: number, frame_height = frame_width, count: number) {
            this.load.spritesheet(AssetLoading.getKey(path), "images/" + path, {
                frameWidth: frame_width,
                frameHeight: frame_height,
                startFrame: 0,
                endFrame: count - 1
            });
        }
    }
}
