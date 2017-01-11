/// <reference path="battle/BattleView.ts"/>

module SpaceTac.View.Specs {
    // Test game wrapper (use instead of jasmine 'it')
    export function ingame_it(desc: string, func: (game: Phaser.Game, state: Phaser.State) => void,
        state: Phaser.State = null, ...stateargs: any[]) {
        it(desc, (done: () => void) => {
            spyOn(console, "log").and.stub();
            spyOn(console, "warn").and.stub();

            var game = new GameUI(true);

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
            var args = stateargs.slice(0);
            args.unshift(true);
            args.unshift(true);
            args.unshift("test");
            game.state.start.apply(game.state, args);
        });
    }

    // Test game wrapper, with a battleview initialized on a random battle
    export function inbattleview_it(desc: string, func: (battleview: BattleView) => void) {
        var battleview = new BattleView();
        var battle = Game.Battle.newQuickRandom();
        var player = battle.playing_ship.getPlayer();
        ingame_it(desc, (game: Phaser.Game, state: Phaser.State) => {
            func(battleview);
        }, battleview, player, battle);
    }
}
