module TK.Specs {
    testing("Toggle", test => {
        let on_calls = 0;
        let off_calls = 0;
        let clock = test.clock();

        test.setup(function () {
            on_calls = 0;
            off_calls = 0;
        });

        function newToggle(): Toggle {
            return new Toggle(() => on_calls++, () => off_calls++);
        }

        function checkstate(on: number, off: number) {
            test.check.same(on_calls, on);
            test.check.same(off_calls, off);
            on_calls = 0;
            off_calls = 0;
        }

        test.case("toggles on and off", check => {
            let toggle = newToggle();
            let client = toggle.manipulate("test");
            checkstate(0, 0);

            let result = client(true);
            check.equals(result, true);
            checkstate(1, 0);

            result = client(true);
            check.equals(result, true);
            checkstate(0, 0);

            clock.forward(10000000);
            checkstate(0, 0);

            result = client(false);
            check.equals(result, false);
            checkstate(0, 1);

            result = client(false);
            check.equals(result, false);
            checkstate(0, 0);

            clock.forward(10000000);
            checkstate(0, 0);

            result = client(true);
            check.equals(result, true);
            checkstate(1, 0);

            let client2 = toggle.manipulate("test2");
            result = client2(true);
            check.equals(result, true);
            checkstate(0, 0);

            result = client(false);
            check.equals(result, true);
            checkstate(0, 0);

            result = client2(false);
            check.equals(result, false);
            checkstate(0, 1);
        })

        test.case("switches between on and off", check => {
            let toggle = newToggle();
            let client = toggle.manipulate("test");
            checkstate(0, 0);

            let result = client();
            check.equals(result, true);
            checkstate(1, 0);

            result = client();
            check.equals(result, false);
            checkstate(0, 1);

            result = client();
            check.equals(result, true);
            checkstate(1, 0);

            let client2 = toggle.manipulate("test2");
            checkstate(0, 0);

            result = client2();
            check.equals(result, true);
            checkstate(0, 0);

            result = client();
            check.equals(result, true);
            checkstate(0, 0);

            result = client2();
            check.equals(result, false);
            checkstate(0, 1);
        })

        test.case("toggles on for a given time", check => {
            let toggle = newToggle();
            let client = toggle.manipulate("test");
            checkstate(0, 0);

            let result = client(100);
            check.equals(result, true);
            checkstate(1, 0);

            check.equals(toggle.isOn(), true);
            checkstate(0, 0);
            clock.forward(60);
            check.equals(toggle.isOn(), true);
            checkstate(0, 0);
            clock.forward(60);
            check.equals(toggle.isOn(), false);
            checkstate(0, 1);

            result = client(100);
            check.equals(result, true);
            checkstate(1, 0);
            result = client(200);
            check.equals(result, true);
            checkstate(0, 0);
            clock.forward(150);
            check.equals(toggle.isOn(), true);
            checkstate(0, 0);
            clock.forward(150);
            check.equals(toggle.isOn(), false);
            checkstate(0, 1);

            let client2 = toggle.manipulate("test2");
            result = client(100);
            check.equals(result, true);
            checkstate(1, 0);
            result = client2(200);
            check.equals(result, true);
            checkstate(0, 0);
            clock.forward(150);
            check.equals(toggle.isOn(), true);
            checkstate(0, 0);
            clock.forward(150);
            check.equals(toggle.isOn(), false);
            checkstate(0, 1);

            result = client(100);
            check.equals(result, true);
            checkstate(1, 0);
            result = client(true);
            check.equals(result, true);
            checkstate(0, 0);
            check.equals(toggle.isOn(), true);
            clock.forward(2000);
            check.equals(toggle.isOn(), true);
            checkstate(0, 0);
        })
    })
}