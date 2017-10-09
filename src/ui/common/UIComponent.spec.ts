module TK.SpaceTac.UI.Specs {
    describe("UIComponent", () => {
        let testgame = setupEmptyView();

        it("controls visibility", function () {
            let component = new UIComponent(testgame.view, 50, 50);

            let container = <Phaser.Group>(<any>component).container;
            expect(container.visible).toBe(true);

            component.setVisible(false);
            expect(container.visible).toBe(false);

            component.setVisible(true);
            expect(container.visible).toBe(true);

            // with transition
            component.setVisible(false, 500);
            expect(container.visible).toBe(true);
            expect(testgame.view.animations.simulate(container, 'alpha')).toEqual([1, 0.5, 0]);
        });

        it("sets position inside parent", function () {
            let comp1 = new UIComponent(testgame.view, 100, 100);
            expect(comp1.getPosition()).toEqual([0, 0]);
            comp1.setPositionInsideParent(1, 1);
            expect(comp1.getPosition()).toEqual([1820, 980]);
            comp1.setPositionInsideParent(0.5, 0.5);
            expect(comp1.getPosition()).toEqual([910, 490]);

            let comp2 = new UIComponent(comp1, 50, 50);
            expect(comp2.getPosition()).toEqual([910, 490]);
            expect(comp2.getPosition(true)).toEqual([0, 0]);
            comp2.setPositionInsideParent(1, 0);
            expect(comp2.getPosition()).toEqual([960, 490]);
            expect(comp2.getPosition(true)).toEqual([50, 0]);

            comp1.setPositionInsideParent(0, 0);
            expect(comp1.getPosition()).toEqual([0, 0]);
            expect(comp2.getPosition()).toEqual([50, 0]);

            comp1.setPositionInsideParent(0.654, 0.321, false);
            expect(comp1.getPosition()).toEqual([1190.28, 314.58]);
            comp1.setPositionInsideParent(0.654, 0.321);
            expect(comp1.getPosition()).toEqual([1190, 315]);
        });
    });
}
