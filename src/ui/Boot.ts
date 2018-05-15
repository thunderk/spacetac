module TK.SpaceTac.UI {
    /**
     * First view to boot.
     * 
     * It is responsible to prepare the screen, and the asset loading.
     */
    export class Boot extends Phaser.Scene {
        preload() {
            this.load.image("preload-background", "images/preload/bar-background.png");
            this.load.image("preload-bar", "images/preload/bar-content.png");
        }

        create() {
            this.add.image(643, 435, "preload-background");

            this.scene.start("router");
        }
    }
}
