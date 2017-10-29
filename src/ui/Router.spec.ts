/// <reference path="TestGame.ts" />
/// <reference path="Router.ts" />

module TK.SpaceTac.UI.Specs {
    testing("Router", test => {
        let testgame = setupSingleView(test, () => [new Router(), []]);

        test.case("loads correctly", check => {
            check.equals(testgame.ui.state.current, "test");
            // TODO test routing
        });
    });
}
