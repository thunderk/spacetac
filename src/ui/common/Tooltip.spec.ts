module TK.SpaceTac.UI.Specs {
    testing("Tooltip", test => {
        let testgame = setupEmptyView(test);

        test.case("shows near the hovered button", check => {
            let button = new UIBuilder(testgame.view).button("fake");
            check.patch(button, "getBounds", () => new Phaser.Geom.Rectangle(100, 50, 50, 25));

            let tooltip = new Tooltip(testgame.view);
            tooltip.bind(button, filler => true);

            let container = tooltip.container;
            check.patch(container.content, "getBounds", () => new Phaser.Geom.Rectangle(0, 0, 32, 32));
            check.equals(container.visible, false);

            let pointer = {};
            button.emit("pointerover", { pointer: pointer });
            check.equals(container.visible, false);

            testgame.clockForward(1000);
            container.update();
            check.equals(container.visible, true);
            check.equals(container.x, 113);
            check.equals(container.y, 91);

            button.emit("pointerout", { pointer: pointer });
            check.equals(container.visible, false);
        });
    });
}
