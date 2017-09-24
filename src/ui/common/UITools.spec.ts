module TK.SpaceTac.UI.Specs {
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
                let pointer = new Phaser.Pointer(testgame.ui, 0);
                function newButton(): [Phaser.Button, any] {
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
                    UITools.hovered = null;
                    return [button, funcs];
                }
                let enter = (button: Phaser.Button) => (<any>button.input)._pointerOverHandler(pointer);
                let leave = (button: Phaser.Button) => (<any>button.input)._pointerOutHandler(pointer);
                let press = (button: Phaser.Button) => button.onInputDown.dispatch(button, pointer);
                let release = (button: Phaser.Button) => button.onInputUp.dispatch(button, pointer);
                let destroy = (button: Phaser.Button) => button.events.onDestroy.dispatch();

                // Simple click on desktop
                let [button, funcs] = newButton();
                enter(button);
                press(button);
                release(button);
                expect(funcs.enter).toHaveBeenCalledTimes(0);
                expect(funcs.leave).toHaveBeenCalledTimes(0);
                expect(funcs.click).toHaveBeenCalledTimes(1);

                // Simple click on mobile
                [button, funcs] = newButton();
                press(button);
                release(button);
                expect(funcs.enter).toHaveBeenCalledTimes(1);
                expect(funcs.leave).toHaveBeenCalledTimes(1);
                expect(funcs.click).toHaveBeenCalledTimes(1);

                // Leaves on destroy
                [button, funcs] = newButton();
                press(button);
                jasmine.clock().tick(150);
                expect(funcs.enter).toHaveBeenCalledTimes(1);
                expect(funcs.leave).toHaveBeenCalledTimes(0);
                expect(funcs.click).toHaveBeenCalledTimes(0);
                destroy(button);
                expect(funcs.enter).toHaveBeenCalledTimes(1);
                expect(funcs.leave).toHaveBeenCalledTimes(1);
                expect(funcs.click).toHaveBeenCalledTimes(0);
                press(button);
                release(button);
                expect(funcs.enter).toHaveBeenCalledTimes(1);
                expect(funcs.leave).toHaveBeenCalledTimes(1);
                expect(funcs.click).toHaveBeenCalledTimes(0);

                // Force-leave when hovering another button without clean leaving a first one
                let [button1, funcs1] = newButton();
                let [button2, funcs2] = newButton();
                enter(button1);
                jasmine.clock().tick(150);
                expect(funcs1.enter).toHaveBeenCalledTimes(1);
                expect(funcs1.leave).toHaveBeenCalledTimes(0);
                expect(funcs1.click).toHaveBeenCalledTimes(0);
                enter(button2);
                expect(funcs1.enter).toHaveBeenCalledTimes(1);
                expect(funcs1.leave).toHaveBeenCalledTimes(1);
                expect(funcs1.click).toHaveBeenCalledTimes(0);
                expect(funcs2.enter).toHaveBeenCalledTimes(0);
                expect(funcs2.leave).toHaveBeenCalledTimes(0);
                expect(funcs2.click).toHaveBeenCalledTimes(0);
                jasmine.clock().tick(150);
                expect(funcs1.enter).toHaveBeenCalledTimes(1);
                expect(funcs1.leave).toHaveBeenCalledTimes(1);
                expect(funcs1.click).toHaveBeenCalledTimes(0);
                expect(funcs2.enter).toHaveBeenCalledTimes(1);
                expect(funcs2.leave).toHaveBeenCalledTimes(0);
                expect(funcs2.click).toHaveBeenCalledTimes(0);

                // Hold to hover on mobile
                jasmine.clock().uninstall();
                [button, funcs] = newButton();
                button.onInputDown.dispatch(button, pointer);
                Timer.global.schedule(150, () => {
                    expect(funcs.enter).toHaveBeenCalledTimes(1);
                    expect(funcs.leave).toHaveBeenCalledTimes(0);
                    expect(funcs.click).toHaveBeenCalledTimes(0);
                    button.onInputUp.dispatch(button, pointer);
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
