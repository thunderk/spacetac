module TK.SpaceTac.UI.Specs {
    describe("InputManager", function () {
        let testgame = setupEmptyView();

        it("handles hover and click on desktops and mobile targets", function (done) {
            let inputs = testgame.view.inputs;

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

        it("handles drag and drop", function () {
            let builder = new UIBuilder(testgame.view);
            let button = builder.button("test", 0, 0, () => null, "test tooltip");
            let tooltip = (<any>testgame.view.tooltip).container;

            expect(button.inputEnabled).toBe(true, "input should be enabled initially");
            expect(button.input.draggable).toBe(false, "dragging should be disabled initially");

            let x = 0;
            testgame.view.inputs.setDragDrop(button, () => x += 1, () => x -= 1);

            expect(button.inputEnabled).toBe(true, "input should still be enabled");
            expect(button.input.draggable).toBe(true, "dragging should be enabled");

            expect(tooltip.visible).toBe(false, "tooltip hidden initially");
            expect(button.onInputOver.dispatch(button, testgame.ui.input.pointer1));
            jasmine.clock().tick(1000);
            expect(tooltip.visible).toBe(true, "tooltip shown");

            expect(x).toBe(0, "initial state");
            button.events.onDragStart.dispatch();
            expect(x).toBe(1, "dragged");
            expect(tooltip.visible).toBe(false, "tooltip hidden on dragging");
            button.events.onDragStop.dispatch();
            expect(x).toBe(0, "dropped");

            testgame.view.inputs.setDragDrop(button);

            button.events.onDragStart.dispatch();
            expect(x).toBe(0, "drag signal should be disabled");
            expect(button.inputEnabled).toBe(true, "input should remain enabled");
            expect(button.input.draggable).toBe(false, "dragging should be disabled at the end");

            testgame.view.inputs.setDragDrop(button, () => x += 1, () => x -= 1);
            button.events.onDragStart.dispatch();
            expect(x).toBe(1, "drag signal should be dispatch once");
        });
    });
}
