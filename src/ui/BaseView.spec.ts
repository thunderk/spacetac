/// <reference path="TestGame.ts" />

module TK.SpaceTac.UI.Specs {
    describe("BaseView", function () {
        let testgame = setupEmptyView();

        it("initializes variables", function () {
            let view = <BaseView>testgame.ui.state.getCurrentState();

            expect(view.messages instanceof Messages).toBe(true);
            expect(view.inputs instanceof InputManager).toBe(true);

            expect(view.getWidth()).toEqual(1920);
            expect(view.getHeight()).toEqual(1080);
            expect(view.getMidWidth()).toEqual(960);
            expect(view.getMidHeight()).toEqual(540);
        });
    });
}
