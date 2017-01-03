module SpaceTac.View {
    export class Boot extends Phaser.State {
        preload() {
            this.game.stage.backgroundColor = 0x202020;
            this.add.text(640, 340, "... Loading ...", {align: "center", font: "bold 20px Arial", fill: "#c0c0c0"})
                .anchor.set(0.5, 0.5);

            this.load.image("preload-bar", "assets/images/preloader.gif");
        }

        create() {
            this.input.maxPointers = 1;
            this.stage.disableVisibilityChange = true;

            this.game.state.start("preload");
        }
    }
}
