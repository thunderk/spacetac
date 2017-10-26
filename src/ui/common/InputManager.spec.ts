module TK.SpaceTac.UI.Specs {
    testing("InputManager", test => {
        let testgame = setupEmptyView();
        let clock = test.clock();

        test.case("handles hover and click on desktops and mobile targets", check => {
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
            clock.forward(150);
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
            clock.forward(150);
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
            clock.forward(150);
            expect(funcs1.enter).toHaveBeenCalledTimes(1);
            expect(funcs1.leave).toHaveBeenCalledTimes(1);
            expect(funcs1.click).toHaveBeenCalledTimes(0);
            expect(funcs2.enter).toHaveBeenCalledTimes(1);
            expect(funcs2.leave).toHaveBeenCalledTimes(0);
            expect(funcs2.click).toHaveBeenCalledTimes(0);

            // Hold to hover on mobile
            [button, funcs] = newButton();
            button.onInputDown.dispatch(button, pointer);
            clock.forward(150);
            expect(funcs.enter).toHaveBeenCalledTimes(1);
            expect(funcs.leave).toHaveBeenCalledTimes(0);
            expect(funcs.click).toHaveBeenCalledTimes(0);
            button.onInputUp.dispatch(button, pointer);
            expect(funcs.enter).toHaveBeenCalledTimes(1);
            expect(funcs.leave).toHaveBeenCalledTimes(1);
            expect(funcs.click).toHaveBeenCalledTimes(0);
        });

        test.case("handles drag and drop", check => {
            let builder = new UIBuilder(testgame.view);
            let button = builder.button("test", 0, 0, () => null, "test tooltip");
            let tooltip = (<any>testgame.view.tooltip).container;

            check.same(button.inputEnabled, true, "input should be enabled initially");
            check.same(button.input.draggable, false, "dragging should be disabled initially");

            let x = 0;
            testgame.view.inputs.setDragDrop(button, () => x += 1, () => x -= 1);

            check.same(button.inputEnabled, true, "input should still be enabled");
            check.same(button.input.draggable, true, "dragging should be enabled");

            check.same(tooltip.visible, false, "tooltip hidden initially");
            button.onInputOver.dispatch(button, testgame.ui.input.pointer1);
            clock.forward(1000);
            check.same(tooltip.visible, true, "tooltip shown");

            check.same(x, 0, "initial state");
            button.events.onDragStart.dispatch();
            check.same(x, 1, "dragged");
            check.same(tooltip.visible, false, "tooltip hidden on dragging");
            button.events.onDragStop.dispatch();
            check.same(x, 0, "dropped");

            testgame.view.inputs.setDragDrop(button);

            button.events.onDragStart.dispatch();
            check.same(x, 0, "drag signal should be disabled");
            check.same(button.inputEnabled, true, "input should remain enabled");
            check.same(button.input.draggable, false, "dragging should be disabled at the end");

            testgame.view.inputs.setDragDrop(button, () => x += 1, () => x -= 1);
            button.events.onDragStart.dispatch();
            check.same(x, 1, "drag signal should be dispatch once");
        });
    });
}
