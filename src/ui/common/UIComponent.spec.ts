module TK.SpaceTac.UI.Specs {
    testing("UIComponent", test => {
        let testgame = setupEmptyView(test);

        test.case("controls visibility", check => {
            let component = new UIComponent(testgame.view, 50, 50);

            let container = <Phaser.Group>(<any>component).container;
            check.equals(container.visible, true);

            component.setVisible(false);
            check.equals(container.visible, false);

            component.setVisible(true);
            check.equals(container.visible, true);

            // with transition
            component.setVisible(false, 500);
            check.equals(container.visible, true);
            check.equals(testgame.view.animations.simulate(container, 'alpha'), [1, 0.5, 0]);
        });

        test.case("sets position inside parent", check => {
            let comp1 = new UIComponent(testgame.view, 100, 100);
            check.equals(comp1.getPosition(), [0, 0]);
            comp1.setPositionInsideParent(1, 1);
            check.equals(comp1.getPosition(), [1820, 980]);
            comp1.setPositionInsideParent(0.5, 0.5);
            check.equals(comp1.getPosition(), [910, 490]);

            let comp2 = new UIComponent(comp1, 50, 50);
            check.equals(comp2.getPosition(), [910, 490]);
            check.equals(comp2.getPosition(true), [0, 0]);
            comp2.setPositionInsideParent(1, 0);
            check.equals(comp2.getPosition(), [960, 490]);
            check.equals(comp2.getPosition(true), [50, 0]);

            comp1.setPositionInsideParent(0, 0);
            check.equals(comp1.getPosition(), [0, 0]);
            check.equals(comp2.getPosition(), [50, 0]);

            comp1.setPositionInsideParent(0.654, 0.321, false);
            check.equals(comp1.getPosition(), [1190.28, 314.58]);
            comp1.setPositionInsideParent(0.654, 0.321);
            check.equals(comp1.getPosition(), [1190, 315]);
        });
    });
}
