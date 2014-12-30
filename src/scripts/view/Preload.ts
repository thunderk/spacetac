module SpaceTac.View {
    export class Preload extends Phaser.State {
        private preloadBar: Phaser.Sprite;

        preload() {
            // Add preload sprite
            this.preloadBar = this.add.sprite(290, 290, 'preload-bar');
            this.load.setPreloadSprite(this.preloadBar);

            // Load assets
            this.load.image("ui-shiplist-own", "assets/images/ui/shiplist-own.png");
            this.load.image("ui-shiplist-enemy", "assets/images/ui/shiplist-enemy.png");
            this.load.image("arena-ship", "assets/images/arena/ship01.png");
        }

        create() {
            this.game.state.start('main');
        }
    }
}
