/// <reference path="TestGame.ts" />
/// <reference path="Boot.ts" />

module TS.SpaceTac.UI.Specs {
    function inview_it(desc: string, func: (view: Boot) => void) {
        var view = new Boot();
        ingame_it(desc, (game: Phaser.Game, state: Phaser.State) => {
            func(view);
        }, view);
    }

    describe("Boot", () => {
        inview_it("places empty loading background", function (view) {
            expect(view.world.children.length).toBe(1);
            expect(view.world.children[0] instanceof Phaser.Image).toBe(true);
        });
    });
}
