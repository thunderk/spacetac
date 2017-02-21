module TS.SpaceTac.UI.Specs {
    describe("Tools", function () {
        let testgame = setupEmptyView();

        it("normalizes angles", function () {
            expect(Tools.normalizeAngle(0)).toEqual(0);
            expect(Tools.normalizeAngle(0.1)).toBeCloseTo(0.1, 0.000001);
            expect(Tools.normalizeAngle(Math.PI)).toBeCloseTo(Math.PI, 0.000001);
            expect(Tools.normalizeAngle(Math.PI + 0.5)).toBeCloseTo(-Math.PI + 0.5, 0.000001);
            expect(Tools.normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI, 0.000001);
            expect(Tools.normalizeAngle(-Math.PI - 0.5)).toBeCloseTo(Math.PI - 0.5, 0.000001);
        });

        it("handles hover and click on desktops and mobile targets", function () {
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
                Tools.setHoverClick(button, funcs.enter, funcs.leave, funcs.click, 50, 100);
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
        });
    });
}
