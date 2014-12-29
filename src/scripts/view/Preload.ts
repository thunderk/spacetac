module SpaceTac.View {
    export class Preload extends Phaser.State {
        private preloadBar: Phaser.Sprite;

        preload() {
            this.preloadBar = this.add.sprite(290, 290, 'preload-bar');
        }

        create() {
            this.game.state.start('main');
        }
    }
}
