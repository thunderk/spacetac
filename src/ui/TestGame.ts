/// <reference path="battle/BattleView.ts"/>
/// <reference path="map/UniverseMapView.ts"/>

module TS.SpaceTac.UI.Specs {
    // Test game wrapper (use instead of jasmine 'it')
    export function ingame_it(desc: string, func: (game: MainUI, state: Phaser.State) => void,
        state: Phaser.State = null, ...stateargs: any[]) {
        it(desc, (done: () => void) => {
            spyOn(console, "log").and.stub();
            spyOn(console, "warn").and.stub();

            var game = new MainUI(true);

            spyOn(game.load, 'image').and.stub();
            spyOn(game.load, 'audio').and.stub();

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
        var battle = Battle.newQuickRandom();
        var player = battle.playing_ship.getPlayer();
        ingame_it(desc, (game: Phaser.Game, state: Phaser.State) => {
            func(battleview);
        }, battleview, player, battle);
    }

    // Test game wrapper, with a map initialized on a random universe
    export function inmapview_it(desc: string, func: (mapview: UniverseMapView) => void) {
        var mapview = new UniverseMapView();
        var session = new GameSession();
        session.startNewGame();
        ingame_it(desc, (game: Phaser.Game, state: Phaser.State) => {
            func(mapview);
        }, mapview, session.universe, session.player);
    }
}
