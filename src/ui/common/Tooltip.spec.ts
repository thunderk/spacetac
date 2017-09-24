module TK.SpaceTac.UI.Specs {
    describe("Tooltip", () => {
        let testgame = setupEmptyView();

        it("shows near the hovered button", function () {
            let button = testgame.baseview.add.button();
            spyOn(button, "getBounds").and.returnValue({ x: 100, y: 50, width: 50, height: 25 });

            let tooltip = new Tooltip(testgame.baseview);
            tooltip.bind(button, filler => true);

            let container = <Phaser.Group>(<any>tooltip).container;
            spyOn((<any>container).content, "getBounds").and.returnValue({ x: 0, y: 0, width: 32, height: 32 });
            expect(container.visible).toBe(false);

            button.onInputOver.dispatch();
            expect(container.visible).toBe(false);

            jasmine.clock().tick(1000);
            container.update();
            expect(container.visible).toBe(true);
            expect(container.x).toEqual(109);
            expect(container.y).toEqual(91);

            button.onInputOut.dispatch();
            expect(container.visible).toBe(false);
        });
    });
}
