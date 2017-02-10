/// <reference path="TestGame.ts" />
/// <reference path="BaseView.ts" />

module TS.SpaceTac.UI.Specs {
    function inview_it(desc: string, func: (view: BaseView) => void) {
        var view = new BaseView();
        ingame_it(desc, (game: Phaser.Game, state: Phaser.State) => {
            func(view);
        }, view);
    }

    describe("BaseView", () => {
        inview_it("initializes variables", function (view) {
            expect(view.messages instanceof Messages).toBe(true);
            expect(view.inputs instanceof InputManager).toBe(true);

            expect(view.getWidth()).toEqual(1920);
            expect(view.getHeight()).toEqual(1080);
            expect(view.getMidWidth()).toEqual(960);
            expect(view.getMidHeight()).toEqual(540);
        });
    });
}
