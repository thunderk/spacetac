module TS.SpaceTac.UI.Specs {
    describe("UIDialog", () => {
        let testgame = setupEmptyView();

        it("sets up an overlay", function () {
            let view = testgame.baseview;
            expect(view.dialogs_layer.children.length).toBe(0);

            let dialog1 = new UIDialog(view, 10, 10, "fake");
            expect(view.dialogs_layer.children.length).toBe(2);
            expect(view.dialogs_layer.children[0] instanceof Phaser.Button).toBe(true);
            checkComponentInLayer(view.dialogs_layer, 1, dialog1);

            let dialog2 = new UIDialog(view, 10, 10, "fake");
            expect(view.dialogs_layer.children.length).toBe(3);
            expect(view.dialogs_layer.children[0] instanceof Phaser.Button).toBe(true);
            checkComponentInLayer(view.dialogs_layer, 1, dialog1);
            checkComponentInLayer(view.dialogs_layer, 2, dialog2);

            dialog1.close();

            expect(view.dialogs_layer.children.length).toBe(2);
            expect(view.dialogs_layer.children[0] instanceof Phaser.Button).toBe(true);
            checkComponentInLayer(view.dialogs_layer, 1, dialog2);

            dialog2.close();

            expect(view.dialogs_layer.children.length).toBe(0);
        });
    });
}
