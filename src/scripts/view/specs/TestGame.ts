/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.View.Specs {
    "use strict";

    // Internal test state for Phaser
    class TestState extends Phaser.State {
        private testfunc: (game: Phaser.Game) => void;
        private donefunc: () => void;

        init(testfunc: (game: Phaser.Game) => void, donefunc: () => void) {
            this.testfunc = testfunc;
            this.donefunc = donefunc;
        }

        create() {
            this.testfunc(this.game);
            this.game.destroy();
            this.donefunc();
        }
    }

    // Test game wrapper (use instead of jasmine 'it')
    export function ingame_it(desc: string, func: (game: Phaser.Game) => void) {
        it(desc, (done: () => void) => {
            var game = new Phaser.Game(500, 500, Phaser.HEADLESS);
            game.state.add("main", TestState);
            game.state.start("main", true, true, func, done);
        });
    }
}
