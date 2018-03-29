module TK.SpaceTac.UI.Specs {
    testing("Tooltip", test => {
        let testgame = setupEmptyView(test);
        let clock = test.clock();

        test.case("shows near the hovered button", check => {
            let button = testgame.view.add.button();
            check.patch(button, "getBounds", () => new PIXI.Rectangle(100, 50, 50, 25));

            let tooltip = new Tooltip(testgame.view);
            tooltip.bind(button, filler => true);

            let container = <Phaser.Group>(<any>tooltip).container;
            check.patch((<any>container).content, "getBounds", () => new PIXI.Rectangle(0, 0, 32, 32));
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
