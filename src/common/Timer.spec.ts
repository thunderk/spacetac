module TK.Specs {
    testing("Timer", test => {
        let clock = test.clock();

        test.case("schedules and cancels future calls", check => {
            let timer = new Timer();

            let called: any[] = [];
            let callback = (item: any) => called.push(item);

            let s1 = timer.schedule(50, () => callback(1));
            let s2 = timer.schedule(150, () => callback(2));
            let s3 = timer.schedule(250, () => callback(3));

            check.equals(called, []);
            clock.forward(100);
            check.equals(called, [1]);
            timer.cancel(s1);
            check.equals(called, [1]);
            clock.forward(100);
            check.equals(called, [1, 2]);
            timer.cancel(s3);
            clock.forward(100);
            check.equals(called, [1, 2]);
            clock.forward(1000);
            check.equals(called, [1, 2]);
        });

        test.case("may cancel all scheduled", check => {
            let timer = new Timer();

            let called: any[] = [];
            let callback = (item: any) => called.push(item);

            timer.schedule(150, () => callback(1));
            timer.schedule(50, () => callback(2));
            timer.schedule(500, () => callback(3));

            check.equals(called, []);

            clock.forward(100);

            check.equals(called, [2]);

            clock.forward(100);

            check.equals(called, [2, 1]);

            timer.cancelAll();

            clock.forward(1000);

            check.equals(called, [2, 1]);

            timer.schedule(50, () => callback(4));
            timer.schedule(150, () => callback(5));

            clock.forward(100);

            check.equals(called, [2, 1, 4]);

            timer.cancelAll(true);

            clock.forward(100);

            check.equals(called, [2, 1, 4]);

            timer.schedule(50, () => callback(6));

            clock.forward(100);

            check.equals(called, [2, 1, 4]);
        });

        test.case("may switch to synchronous mode", check => {
            let timer = new Timer(true);
            let called: any[] = [];
            let callback = (item: any) => called.push(item);

            timer.schedule(50, () => callback(1));
            check.equals(called, [1]);
        });

        test.acase("sleeps asynchronously", async check => {
            let timer = new Timer();
            let x = 1;

            let promise = timer.sleep(500).then(() => {
                x++;
            });
            check.equals(x, 1);

            clock.forward(300);
            check.equals(x, 1);

            clock.forward(300);
            check.equals(x, 1);

            await promise;
            check.equals(x, 2);
        });

        test.case("gives current time in milliseconds", check => {
            check.equals(Timer.nowMs(), 0);

            clock.forward(5);

            check.equals(Timer.nowMs(), 5);
            let t = Timer.nowMs();

            clock.forward(10);

            check.equals(Timer.nowMs(), 15);
            check.equals(Timer.fromMs(t), 10);
        });
    });
}