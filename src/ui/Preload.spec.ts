/// <reference path="TestGame.ts" />
/// <reference path="Preload.ts" />

module TS.SpaceTac.UI.Specs {
    function inview_it(desc: string, func: (view: Preload) => void) {
        var view = new Preload();
        ingame_it(desc, (game: Phaser.Game, state: Phaser.State) => {
            func(view);
        }, view);
    }

    describe("Preload", () => {
        inview_it("loads correctly", function (view) {
            expect(view.game.state.current).toEqual("test");
            // TODO test asset loading
        });
    });
}
