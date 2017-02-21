/// <reference path="TestGame.ts" />
/// <reference path="Preload.ts" />

module TS.SpaceTac.UI.Specs {
    describe("Preload", () => {
        let testgame = setupSingleView(testgame => [new Preload(), []]);

        it("loads correctly", function () {
            expect(testgame.ui.state.current).toEqual("test");
            // TODO test asset loading
        });
    });
}
