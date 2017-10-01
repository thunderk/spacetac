module TK.SpaceTac.UI.Specs {
    describe("InputManager", function () {
        let testgame = setupEmptyView();

        it("handles hover and click on desktops and mobile targets", function (done) {
            let inputs = testgame.baseview.inputs;

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
                inputs.setHoverClick(button, funcs.enter, funcs.leave, funcs.click, 50, 100);
                (<any>inputs).hovered = null;
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
}
