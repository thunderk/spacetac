module TK.SpaceTac.UI.Specs {
    testing("InputManager", test => {
        let testgame = setupEmptyView(test);
        let clock = test.clock();

        test.case("handles hover and click on desktops and mobile targets", check => {
            let inputs = testgame.view.inputs;

            let pointer = new Phaser.Pointer(testgame.ui, 0);
            function newButton(): [Phaser.Button, { enter: Mock, leave: Mock, click: Mock }] {
                let button = new Phaser.Button(testgame.ui);
                let mocks = {
                    enter: check.mockfunc("enter"),
                    leave: check.mockfunc("leave"),
                    click: check.mockfunc("click"),
                };
                inputs.setHoverClick(button, mocks.enter.func, mocks.leave.func, mocks.click.func, 50, 100);
                (<any>inputs).hovered = null;
                return [button, mocks];
            }
            let enter = (button: Phaser.Button) => (<any>button.input)._pointerOverHandler(pointer);
            let leave = (button: Phaser.Button) => (<any>button.input)._pointerOutHandler(pointer);
            let press = (button: Phaser.Button) => button.onInputDown.dispatch(button, pointer);
            let release = (button: Phaser.Button) => button.onInputUp.dispatch(button, pointer);
            let destroy = (button: Phaser.Button) => button.events.onDestroy.dispatch();

            // Simple click on desktop
            let [button, mocks] = newButton();
            enter(button);
            press(button);
            release(button);
            check.called(mocks.enter, 0);
            check.called(mocks.leave, 0);
            check.called(mocks.click, 1);

            // Simple click on mobile
            [button, mocks] = newButton();
            press(button);
            release(button);
            check.called(mocks.enter, 1);
            check.called(mocks.leave, 1);
            check.called(mocks.click, 1);

            // Leaves on destroy
            [button, mocks] = newButton();
            press(button);
            clock.forward(150);
            check.called(mocks.enter, 1);
            check.called(mocks.leave, 0);
            check.called(mocks.click, 0);
            destroy(button);
            check.called(mocks.enter, 0);
            check.called(mocks.leave, 1);
            check.called(mocks.click, 0);
            press(button);
            release(button);
            check.called(mocks.enter, 0);
            check.called(mocks.leave, 0);
            check.called(mocks.click, 0);

            // Force-leave when hovering another button without clean leaving a first one
            let [button1, funcs1] = newButton();
            let [button2, funcs2] = newButton();
            enter(button1);
            clock.forward(150);
            check.called(funcs1.enter, 1);
            check.called(funcs1.leave, 0);
            check.called(funcs1.click, 0);
            enter(button2);
            check.called(funcs1.enter, 0);
            check.called(funcs1.leave, 1);
            check.called(funcs1.click, 0);
            check.called(funcs2.enter, 0);
            check.called(funcs2.leave, 0);
            check.called(funcs2.click, 0);
            clock.forward(150);
            check.called(funcs1.enter, 0);
            check.called(funcs1.leave, 0);
            check.called(funcs1.click, 0);
            check.called(funcs2.enter, 1);
            check.called(funcs2.leave, 0);
            check.called(funcs2.click, 0);

            // Hold to hover on mobile
            [button, mocks] = newButton();
            button.onInputDown.dispatch(button, pointer);
            clock.forward(150);
            check.called(mocks.enter, 1);
            check.called(mocks.leave, 0);
            check.called(mocks.click, 0);
            button.onInputUp.dispatch(button, pointer);
            check.called(mocks.enter, 0);
            check.called(mocks.leave, 1);
            check.called(mocks.click, 0);
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
