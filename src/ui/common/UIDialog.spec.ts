module TK.SpaceTac.UI.Specs {
    testing("UIDialog", test => {
        let testgame = setupEmptyView(test);

        test.case("sets up an overlay", check => {
            let view = testgame.view;
            check.equals(view.dialogs_layer.length, 0, "initial");

            let dialog1 = new UIDialog(view, "fake");
            check.in("one dialog", check => {
                check.equals(view.dialogs_layer.length, 2);
                check.equals(view.dialogs_layer.list[0] instanceof UIImage, true);
                check.same(view.dialogs_layer.list[1], dialog1.base);
            });

            let dialog2 = new UIDialog(view, "fake");
            check.in("two dialogs", check => {
                check.equals(view.dialogs_layer.length, 3);
                check.equals(view.dialogs_layer.list[0] instanceof UIImage, true);
                check.same(view.dialogs_layer.list[1], dialog1.base);
                check.same(view.dialogs_layer.list[2], dialog2.base);
            });

            dialog1.close();

            check.in("one dialog closed", check => {
                check.equals(view.dialogs_layer.length, 2);
                check.equals(view.dialogs_layer.list[0] instanceof UIImage, true);
                check.same(view.dialogs_layer.list[1], dialog2.base);
            });

            dialog2.close();

            check.in("all dialogs closed", check => {
                check.equals(view.dialogs_layer.length, 0);
            });
        });
    });
}
