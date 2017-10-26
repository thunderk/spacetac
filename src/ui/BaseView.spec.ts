/// <reference path="TestGame.ts" />

module TK.SpaceTac.UI.Specs {
    testing("BaseView", test => {
        let testgame = setupEmptyView();

        test.case("initializes variables", check => {
            let view = <BaseView>testgame.ui.state.getCurrentState();

            check.equals(view.messages instanceof Messages, true);
            check.equals(view.inputs instanceof InputManager, true);

            check.equals(view.getWidth(), 1920);
            check.equals(view.getHeight(), 1080);
            check.equals(view.getMidWidth(), 960);
            check.equals(view.getMidHeight(), 540);
        });
    });
}
