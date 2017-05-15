module TS.SpaceTac.UI {
    export class Boot extends Phaser.State {
        preload() {
            this.load.image("preload-background", "assets/images/preload/bar-background.png");
            this.load.image("preload-bar", "assets/images/preload/bar-content.png");
        }

        create() {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.stage.backgroundColor = 0x000000;
            this.input.maxPointers = 1;

            this.add.image(678, 426, "preload-background");

            this.game.state.start("preload");
        }
    }
}
