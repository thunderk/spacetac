/// <reference path="definitions/phaser.d.ts"/>

module SpaceTac {
    "use strict";

    // Router between game views
    export class GameRouter extends Phaser.Game {
        // Currently playing universe
        universe: Game.Universe;

        constructor() {
            super(1280, 720, Phaser.AUTO, '-space-tac');

            this.universe = this.newGame();

            this.state.add('boot', View.Boot);
            this.state.add('preload', View.Preload);
            this.state.add('main', View.Main);
            this.state.add('battle', View.BattleView);

            this.state.start('boot');
        }

        newGame(): Game.Universe {
            // Currently create a quick battle
            var universe = new Game.Universe();
            universe.battle = Game.Battle.newQuickRandom(true);
            universe.player = universe.battle.fleets[0].player;
            return universe;
        }
    }
}
