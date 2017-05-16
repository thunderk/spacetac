module TS.SpaceTac.UI.Specs {
    describe("UITools", function () {
        describe("in UI", function () {
            let testgame = setupEmptyView();

            it("keeps objects inside bounds", function () {
                let image = testgame.baseview.add.graphics(150, 100);
                image.beginFill(0xff0000);
                image.drawEllipse(50, 25, 50, 25);
                image.endFill();

                UITools.keepInside(image, { x: 0, y: 0, width: 200, height: 200 });

                expect(image.x).toBe(100);
                expect(image.y).toBe(100);
            });

            it("handles hover and click on desktops and mobile targets", function (done) {
                jasmine.clock().uninstall();

                let newButton: () => [Phaser.Button, any] = () => {
                    var button = new Phaser.Button(testgame.ui);
                    var funcs = {
                        enter: () => null,
                        leave: () => null,
                        click: () => null,
                    };
                    spyOn(funcs, "enter");
                    spyOn(funcs, "leave");
                    spyOn(funcs, "click");
                    UITools.setHoverClick(button, funcs.enter, funcs.leave, funcs.click, 50, 100);
                    return [button, funcs];
                }

                // Simple click on desktop
                let [button, funcs] = newButton();
                button.onInputOver.dispatch();
                button.onInputDown.dispatch();
                button.onInputUp.dispatch();
                expect(funcs.enter).toHaveBeenCalledTimes(0);
                expect(funcs.leave).toHaveBeenCalledTimes(0);
                expect(funcs.click).toHaveBeenCalledTimes(1);

                // Simple click on mobile
                [button, funcs] = newButton();
                button.onInputDown.dispatch();
                button.onInputUp.dispatch();
                expect(funcs.enter).toHaveBeenCalledTimes(1);
                expect(funcs.leave).toHaveBeenCalledTimes(1);
                expect(funcs.click).toHaveBeenCalledTimes(1);

                // Hold to hover on mobile
                [button, funcs] = newButton();
                button.onInputDown.dispatch();
                Timer.global.schedule(150, () => {
                    expect(funcs.enter).toHaveBeenCalledTimes(1);
                    expect(funcs.leave).toHaveBeenCalledTimes(0);
                    expect(funcs.click).toHaveBeenCalledTimes(0);
                    button.onInputUp.dispatch();
                    expect(funcs.enter).toHaveBeenCalledTimes(1);
                    expect(funcs.leave).toHaveBeenCalledTimes(1);
                    expect(funcs.click).toHaveBeenCalledTimes(0);
                    done();
                });
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
