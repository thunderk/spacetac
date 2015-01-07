/// <reference path="definitions/phaser.d.ts"/>

module SpaceTac {
    "use strict";

    // Router between game views
    export class GameRouter extends Phaser.Game {
        constructor() {
            super(800, 600, Phaser.CANVAS, '-space-tac');

            this.state.add('boot', View.Boot);
            this.state.add('preload', View.Preload);
            this.state.add('main', View.Main);
            this.state.add('battle', View.BattleView);

            this.state.start('boot');
        }
    }
}
