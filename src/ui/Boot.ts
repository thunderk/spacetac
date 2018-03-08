module TK.SpaceTac.UI {
    /**
     * First view to boot.
     * 
     * It is responsible to prepare the screen, and the asset loading.
     */
    export class Boot extends Phaser.State {
        preload() {
            if (!(<MainUI>this.game).headless) {
                this.load.image("preload-background", "images/preload/bar-background.png");
                this.load.image("preload-bar", "images/preload/bar-content.png");
            }
        }

        create() {
            this.game.stage.backgroundColor = 0x000000;
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.input.maxPointers = 1;

            this.add.image(678, 426, "preload-background");

            this.game.state.start("router");
        }
    }
}
