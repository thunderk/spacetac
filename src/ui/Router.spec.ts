/// <reference path="TestGame.ts" />
/// <reference path="Router.ts" />

module TS.SpaceTac.UI.Specs {
    function inview_it(desc: string, func: (view: Router) => void) {
        var view = new Router();
        ingame_it(desc, (game: Phaser.Game, state: Phaser.State) => {
            func(view);
        }, view);
    }

    describe("Router", () => {
        inview_it("loads correctly", function (view) {
            expect(view.game.state.current).toEqual("test");
            // TODO test routing
        });
    });
}
