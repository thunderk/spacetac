module TK.SpaceTac.UI.Specs {
    testing("UIButton", test => {
        let testgame = setupEmptyView(test);

        test.case("handles placement of masks", check => {
            check.patch(testgame.view, "getImageInfo", (name: string) => ({ key: "test", frame: 0, exists: true }));
            let builder = new UIBuilder(testgame.view);

            check.in("both on top", check => {
                let button = builder.button("button", 0, 0, nop, undefined, identity);
                check.equals(button.length, 3);
                builder.in(button).text("Test");
                check.equals(button.length, 4);
                check.equals(button.list[0].name, "button");
                check.equals(button.list[1].type, "Text");
                check.equals(button.list[2].name, "button-on");
                check.equals(button.list[3].name, "button-hover");
            });

            check.in("hover at bottom", check => {
                let button = builder.button("button", 0, 0, nop, undefined, identity, { hover_bottom: true });
                check.equals(button.length, 3);
                builder.in(button).text("Test");
                check.equals(button.length, 4);
                check.equals(button.list[0].name, "button");
                check.equals(button.list[1].name, "button-hover");
                check.equals(button.list[2].type, "Text");
                check.equals(button.list[3].name, "button-on");
            });

            check.in("'on' at bottom", check => {
                let button = builder.button("button", 0, 0, nop, undefined, identity, { on_bottom: true });
                check.equals(button.length, 3);
                builder.in(button).text("Test");
                check.equals(button.length, 4);
                check.equals(button.list[0].name, "button");
                check.equals(button.list[1].name, "button-on");
                check.equals(button.list[2].type, "Text");
                check.equals(button.list[3].name, "button-hover");
            });

            check.in("both at bottom", check => {
                let button = builder.button("button", 0, 0, nop, undefined, identity, { hover_bottom: true, on_bottom: true });
                check.equals(button.length, 3);
                builder.in(button).text("Test");
                check.equals(button.length, 4);
                check.equals(button.list[0].name, "button");
                check.equals(button.list[1].name, "button-on");
                check.equals(button.list[2].name, "button-hover");
                check.equals(button.list[3].type, "Text");
            });
        });

        test.case("toggles on/off", check => {
            let builder = new UIBuilder(testgame.view);
            let m1 = check.mockfunc("m1", (on: boolean) => on);
            let button1 = builder.button("b1", 0, 0, undefined, undefined, m1.func);
            let m2 = check.mockfunc("m1", (on: boolean) => on);
            let button2 = builder.button("b2", 0, 0, undefined, undefined, m2.func);
            let m3 = check.mockfunc("m1", (on: boolean) => on);
            let button3 = builder.button("b3", 0, 0, undefined, undefined, m3.func);

            function verify(message: string, state1: boolean, state2: boolean, state3: boolean, called1: number, called2: number, called3: number) {
                check.in(message, check => {
                    check.equals(button1.getState(), state1, "button1 state");
                    check.equals(button2.getState(), state2, "button2 state");
                    check.equals(button3.getState(), state3, "button3 state");
                    check.called(m1, called1);
                    check.called(m2, called2);
                    check.called(m3, called3);
                });
            }

            verify("initial", false, false, false, 0, 0, 0);

            button1.toggle(true);
            verify("toggle on", true, false, false, 1, 0, 0);

            button1.toggle(true);
            verify("toggle on again", true, false, false, 0, 0, 0);

            button1.toggle(false);
            verify("toggle off", false, false, false, 1, 0, 0);

            button1.toggle(false);
            verify("toggle off again", false, false, false, 0, 0, 0);

            button2.toggle(true, UIButtonUnicity.EXCLUSIVE);
            verify("toggle on unicity - first", false, true, false, 0, 1, 0);

            button2.toggle(true, UIButtonUnicity.EXCLUSIVE);
            verify("toggle on unicity - first again", false, true, false, 0, 0, 0);

            button3.toggle(true, UIButtonUnicity.EXCLUSIVE);
            verify("toggle on unicity - second", false, false, true, 0, 1, 1);

            button2.toggle(false, UIButtonUnicity.EXCLUSIVE);
            verify("toggle off unicity - other", false, false, true, 0, 0, 0);

            button3.toggle(false, UIButtonUnicity.EXCLUSIVE);
            verify("toggle off unicity - currently on", false, false, false, 0, 0, 1);

            button1.toggle(true);
            button2.toggle(true);
            button3.toggle(true);
            verify("toggle all on", true, true, true, 1, 1, 1);

            button2.toggle(true, UIButtonUnicity.EXCLUSIVE);
            verify("toggle on unicity should shut down 2 others", false, true, false, 1, 0, 1);

            button2.toggle(true, UIButtonUnicity.EXCLUSIVE_MIN);
            verify("toggle off unicity min", false, true, false, 0, 0, 0);
        });
    });
}
