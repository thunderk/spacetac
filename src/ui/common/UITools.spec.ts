module TK.SpaceTac.UI.Specs {
    describe("UITools", function () {
        describe("in UI", function () {
            let testgame = setupEmptyView();

            it("destroys children", function () {
                let parent = testgame.baseview.add.group();
                let child1 = testgame.baseview.add.graphics(0, 0, parent);
                let child2 = testgame.baseview.add.image(0, 0, "", 0, parent);
                let child3 = testgame.baseview.add.button(0, 0, "", undefined, undefined, undefined, undefined, undefined, undefined, parent);
                let child4 = testgame.baseview.add.text(0, 0, "", {}, parent);
                expect(parent.children.length).toBe(4);

                destroyChildren(parent, 1, 2);
                expect(parent.children.length).toBe(2);

                destroyChildren(parent);
                expect(parent.children.length).toBe(0);
            });

            it("keeps objects inside bounds", function () {
                let image = testgame.baseview.add.graphics(150, 100);
                image.beginFill(0xff0000);
                image.drawEllipse(50, 25, 50, 25);
                image.endFill();

                UITools.keepInside(image, { x: 0, y: 0, width: 200, height: 200 });

                expect(image.x).toBe(100);
                expect(image.y).toBe(100);
            });
        });

        it("normalizes angles", function () {
            expect(UITools.normalizeAngle(0)).toEqual(0);
            expect(UITools.normalizeAngle(0.1)).toBeCloseTo(0.1, 0.000001);
            expect(UITools.normalizeAngle(Math.PI)).toBeCloseTo(Math.PI, 0.000001);
            expect(UITools.normalizeAngle(Math.PI + 0.5)).toBeCloseTo(-Math.PI + 0.5, 0.000001);
            expect(UITools.normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI, 0.000001);
            expect(UITools.normalizeAngle(-Math.PI - 0.5)).toBeCloseTo(Math.PI - 0.5, 0.000001);
        });

        it("spaces items evenly", function () {
            expect(UITools.evenlySpace(100, 20, 0)).toEqual([]);
            expect(UITools.evenlySpace(100, 20, 1)).toEqual([50]);
            expect(UITools.evenlySpace(100, 20, 2)).toEqual([25, 75]);
            expect(UITools.evenlySpace(100, 20, 5)).toEqual([10, 30, 50, 70, 90]);
            expect(UITools.evenlySpace(100, 20, 6)).toEqual([10, 26, 42, 58, 74, 90]);
        });
    });
}
