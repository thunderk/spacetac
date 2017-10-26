module TK.SpaceTac.UI.Specs {
    testing("UIDialog", test => {
        let testgame = setupEmptyView();

        test.case("sets up an overlay", check => {
            let view = testgame.view;
            check.equals(view.dialogs_layer.children.length, 0);

            let dialog1 = new UIDialog(view, 10, 10, "fake");
            check.equals(view.dialogs_layer.children.length, 2);
            check.equals(view.dialogs_layer.children[0] instanceof Phaser.Button, true);
            checkComponentInLayer(check, view.dialogs_layer, 1, dialog1);

            let dialog2 = new UIDialog(view, 10, 10, "fake");
            check.equals(view.dialogs_layer.children.length, 3);
            check.equals(view.dialogs_layer.children[0] instanceof Phaser.Button, true);
            checkComponentInLayer(check, view.dialogs_layer, 1, dialog1);
            checkComponentInLayer(check, view.dialogs_layer, 2, dialog2);

            dialog1.close();

            check.equals(view.dialogs_layer.children.length, 2);
            check.equals(view.dialogs_layer.children[0] instanceof Phaser.Button, true);
            checkComponentInLayer(check, view.dialogs_layer, 1, dialog2);

            dialog2.close();

            check.equals(view.dialogs_layer.children.length, 0);
        });
    });
}
