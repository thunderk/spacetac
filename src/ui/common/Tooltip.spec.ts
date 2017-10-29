module TK.SpaceTac.UI.Specs {
    testing("Tooltip", test => {
        let testgame = setupEmptyView(test);
        let clock = test.clock();

        test.case("shows near the hovered button", check => {
            let button = testgame.view.add.button();
            check.patch(button, "getBounds", () => ({ x: 100, y: 50, width: 50, height: 25 }));

            let tooltip = new Tooltip(testgame.view);
            tooltip.bind(button, filler => true);

            let container = <Phaser.Group>(<any>tooltip).container;
            check.patch((<any>container).content, "getBounds", () => ({ x: 0, y: 0, width: 32, height: 32 }));
            check.equals(container.visible, false);

            button.onInputOver.dispatch();
            check.equals(container.visible, false);

            clock.forward(1000);
            container.update();
            check.equals(container.visible, true);
            check.equals(container.x, 109);
            check.equals(container.y, 91);

            button.onInputOut.dispatch();
            check.equals(container.visible, false);
        });
    });
}
