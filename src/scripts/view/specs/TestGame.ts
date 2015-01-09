/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.View.Specs {
    "use strict";

    // Test game wrapper (use instead of jasmine 'it')
    export function ingame_it(desc: string, func: (game: Phaser.Game, state: Phaser.State) => void,
                              state: Phaser.State = null, ...stateargs: any[]) {
        it(desc, (done: () => void) => {
            var game = new Phaser.Game(500, 500, Phaser.HEADLESS);

            if (!state) {
                state = new Phaser.State();
            }

            var orig_create = state.create;
            state.create = function () {
                orig_create.apply(state);
                func(game, state);
                done();
                setTimeout(() => {
                    game.destroy();
                }, 1000);
            };

            game.state.add("test", state);
            stateargs.unshift(true);
            stateargs.unshift(true);
            stateargs.unshift("test");
            game.state.start.apply(game.state, stateargs);
        });
    }
}
