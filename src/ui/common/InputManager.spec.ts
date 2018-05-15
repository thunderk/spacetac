module TK.SpaceTac.UI.Specs {
    testing("InputManager", test => {
        let testgame = setupEmptyView(test);
        let clock = test.clock();

        test.case("handles hover and click on desktops and mobile targets", check => {
            let inputs = testgame.view.inputs;

            let pointer = new Phaser.Input.Pointer(testgame.view.input.manager, 0);
            function newButton(): [UIImage, { enter: Mock<Function>, leave: Mock<Function>, click: Mock<Function> }] {
                let button = new UIImage(testgame.view, 0, 0, "fake");
                let mocks = {
                    enter: check.mockfunc("enter"),
                    leave: check.mockfunc("leave"),
                    click: check.mockfunc("click"),
                };
                inputs.setHoverClick(button, mocks.enter.func, mocks.leave.func, mocks.click.func, 50, 100);
                (<any>inputs).hovered = null;
                return [button, mocks];
            }
            let enter = (button: UIImage) => button.emit("pointerover", pointer);
            let leave = (button: UIImage) => button.emit("pointerout", pointer);
            let press = (button: UIImage) => button.emit("pointerdown", pointer);
            let release = (button: UIImage) => button.emit("pointerup", pointer);
            let destroy = (button: UIImage) => button.emit("destroy");

            let [button, mocks] = newButton();
            check.in("Simple click on desktop", check => {
                enter(button);
                press(button);
                release(button);
                check.called(mocks.enter, 0);
                check.called(mocks.leave, 0);
                check.called(mocks.click, 1);
            });

            [button, mocks] = newButton();
            check.in("Simple click on mobile", check => {
                press(button);
                release(button);
                check.called(mocks.enter, 1);
                check.called(mocks.leave, 1);
                check.called(mocks.click, 1);
            });

            [button, mocks] = newButton();
            check.in("Leaves on destroy", check => {
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
            });

            check.in("Force-leave when hovering another button without clean leaving a first one", check => {
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
            });

            [button, mocks] = newButton();
            check.in("Hold to hover on mobile", check => {
                button.emit("pointerdown", pointer);
                clock.forward(150);
                check.called(mocks.enter, 1);
                check.called(mocks.leave, 0);
                check.called(mocks.click, 0);
                button.emit("pointerup", pointer);
                check.called(mocks.enter, 0);
                check.called(mocks.leave, 1);
                check.called(mocks.click, 0);
            });
        });
    });
}
