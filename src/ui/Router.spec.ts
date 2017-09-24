/// <reference path="TestGame.ts" />
/// <reference path="Router.ts" />

module TK.SpaceTac.UI.Specs {
    describe("Router", () => {
        let testgame = setupSingleView(testgame => [new Router(), []]);

        it("loads correctly", function () {
            expect(testgame.ui.state.current).toEqual("test");
            // TODO test routing
        });
    });
}
