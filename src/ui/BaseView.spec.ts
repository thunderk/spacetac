module TK.SpaceTac.UI.Specs {
    testing("BaseView", test => {
        let testgame = setupEmptyView(test);

        test.case("initializes variables", check => {
            let view = testgame.view;

            check.instance(view, BaseView, "view should be a BaseView");
            check.instance(view.messages, Messages, "view.messages should be a Messages");
            check.instance(view.inputs, InputManager, "view.inputs should be a InputManager");
            check.instance(view.audio, Audio, "view.audio should be an Audio");

            check.equals(view.getWidth(), 1920);
            check.equals(view.getHeight(), 1080);
            check.equals(view.getMidWidth(), 960);
            check.equals(view.getMidHeight(), 540);
        });
    });
}
