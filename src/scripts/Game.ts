/// <reference path="definitions/phaser.d.ts"/>

module SpaceTac {
  export class Game extends Phaser.Game {
    constructor() {
      super(800, 600, Phaser.CANVAS, '-space-tac');

      this.state.add('boot', State.Boot);
      this.state.add('preload', State.Preload);
      this.state.add('main', State.Main);

      this.state.start('boot');
    }
  }
}
