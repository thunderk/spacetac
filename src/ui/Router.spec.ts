/// <reference path="TestGame.ts" />
/// <reference path="Router.ts" />

module TK.SpaceTac.UI.Specs {
    testing("Router", test => {
        let testgame = setupSingleView(test, () => [new Router({}), {}]);

        test.case("loads correctly", check => {
            check.instance(testgame.ui.getActiveScene(), Router, "active scene should be Router");
            // TODO test routing
        });
    });
}
