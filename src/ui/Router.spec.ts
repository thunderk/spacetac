module TK.SpaceTac.UI.Specs {
    testing("Router", test => {
        let testgame = setupSingleView(test, () => [new Router({}), {}]);

        test.case("loads correctly", check => {
            check.instance(testgame.ui.scene.scenes[0], Router, "active scene should be Router");
            // TODO test routing
        });
    });
}
