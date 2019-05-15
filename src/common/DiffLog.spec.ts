module TK.Specs {
    class TestState {
        counter = 0
    }

    class TestDiff extends Diff<TestState> {
        private value: number
        constructor(value = 1) {
            super();
            this.value = value;
        }
        apply(state: TestState) {
            state.counter += this.value;
        }
        getReverse() {
            return new TestDiff(-this.value);
        }
    }

    testing("DiffLog", test => {
        test.case("stores sequential events", check => {
            let log = new DiffLog<TestState>();
            check.equals(log.count(), 0);
            check.equals(log.get(0), null);
            check.equals(log.get(1), null);
            check.equals(log.get(2), null);

            log.add(new TestDiff(2));
            check.equals(log.count(), 1);
            check.equals(log.get(0), new TestDiff(2));
            check.equals(log.get(1), null);
            check.equals(log.get(2), null);

            log.add(new TestDiff(-4));
            check.equals(log.count(), 2);
            check.equals(log.get(0), new TestDiff(2));
            check.equals(log.get(1), new TestDiff(-4));
            check.equals(log.get(2), null);

            log.clear(1);
            check.equals(log.count(), 1);
            check.equals(log.get(0), new TestDiff(2));

            log.clear();
            check.equals(log.count(), 0);
        })
    })

    testing("DiffLogClient", test => {
        test.case("adds diffs to the log", check => {
            let log = new DiffLog<TestState>();
            let state = new TestState();
            let client = new DiffLogClient(state, log);

            check.equals(client.atEnd(), true, "client is empty, should be at end");
            check.equals(log.count(), 0, "log is empty initially");
            check.equals(state.counter, 0, "initial state is 0");

            client.add(new TestDiff(3));
            check.equals(client.atEnd(), true, "client still at end");
            check.equals(log.count(), 1, "diff added to log");
            check.equals(state.counter, 3, "diff applied to state");

            client.add(new TestDiff(2), false);
            check.equals(client.atEnd(), false, "client lapsing behind");
            check.equals(log.count(), 2, "diff added to log");
            check.equals(state.counter, 3, "diff not applied to state");
        })

        test.case("initializes at current state (end of log)", check => {
            let state = new TestState();
            let log = new DiffLog<TestState>();
            log.add(new TestDiff(7));
            let client = new DiffLogClient(state, log);
            check.equals(client.atStart(), false);
            check.equals(client.atEnd(), true);
            check.equals(state.counter, 0);
            client.forward();
            check.equals(state.counter, 0);
            client.backward();
            check.equals(state.counter, -7);
        })

        test.case("moves forward or backward in the log", check => {
            let log = new DiffLog<TestState>();
            let state = new TestState();
            let client = new DiffLogClient(state, log);

            log.add(new TestDiff(7));
            log.add(new TestDiff(-2));
            log.add(new TestDiff(4));

            check.equals(state.counter, 0, "initial state is 0");
            check.equals(client.atStart(), true, "client is at start");
            check.equals(client.atEnd(), false, "client is not at end");

            client.forward();
            check.equals(state.counter, 7, "0+7 => 7");
            check.equals(client.atStart(), false, "client is not at start");
            check.equals(client.atEnd(), false, "client is not at end");

            client.forward();
            check.equals(state.counter, 5, "7-2 => 5");
            check.equals(client.atStart(), false, "client is not at start");
            check.equals(client.atEnd(), false, "client is not at end");

            client.forward();
            check.equals(state.counter, 9, "5+4 => 9");
            check.equals(client.atStart(), false, "client is not at start");
            check.equals(client.atEnd(), true, "client is at end");

            client.forward();
            check.equals(state.counter, 9, "at end, still 9");
            check.equals(client.atStart(), false, "client is not at start");
            check.equals(client.atEnd(), true, "client is at end");

            client.backward();
            check.equals(state.counter, 5, "9-4=>5");
            check.equals(client.atStart(), false, "client is not at start");
            check.equals(client.atEnd(), false, "client is not at end");

            client.backward();
            check.equals(state.counter, 7, "5+2=>7");
            check.equals(client.atStart(), false, "client is not at start");
            check.equals(client.atEnd(), false, "client is not at end");

            client.backward();
            check.equals(state.counter, 0, "7-7=>0");
            check.equals(client.atStart(), true, "client is back at start");
            check.equals(client.atEnd(), false, "client is not at end");

            client.backward();
            check.equals(state.counter, 0, "at start, still 0");
            check.equals(client.atStart(), true, "client is at start");
            check.equals(client.atEnd(), false, "client is not at end");
        })

        test.case("jumps to start or end of the log", check => {
            let log = new DiffLog<TestState>();
            let state = new TestState();
            let client = new DiffLogClient(state, log);

            client.add(new TestDiff(7));
            log.add(new TestDiff(-2));
            log.add(new TestDiff(4));

            check.equals(state.counter, 7, "initial state is 7");
            check.equals(client.atStart(), false, "client is not at start");
            check.equals(client.atEnd(), false, "client is not at end");

            client.jumpToEnd();
            check.equals(state.counter, 9, "7-2+4=>9");
            check.equals(client.atStart(), false, "client is not at start");
            check.equals(client.atEnd(), true, "client at end");

            client.jumpToEnd();
            check.equals(state.counter, 9, "still 9");
            check.equals(client.atStart(), false, "client is not at start");
            check.equals(client.atEnd(), true, "client at end");

            client.jumpToStart();
            check.equals(state.counter, 0, "9-4+2-7=>0");
            check.equals(client.atStart(), true, "client is at start");
            check.equals(client.atEnd(), false, "client at not end");

            client.jumpToStart();
            check.equals(state.counter, 0, "still 0");
            check.equals(client.atStart(), true, "client is at start");
            check.equals(client.atEnd(), false, "client at not end");
        })

        test.case("truncate the log", check => {
            let log = new DiffLog<TestState>();
            let state = new TestState();
            let client = new DiffLogClient(state, log);

            client.add(new TestDiff(7));
            client.add(new TestDiff(3));
            client.add(new TestDiff(5));

            check.in("initial state", check => {
                check.equals(state.counter, 15, "state=15");
                check.equals(log.count(), 3, "count=3");
            });

            client.backward();

            check.in("after backward", check => {
                check.equals(state.counter, 10, "state=10");
                check.equals(log.count(), 3, "count=3");
            });

            client.truncate();

            check.in("after truncate", check => {
                check.equals(state.counter, 10, "state=10");
                check.equals(log.count(), 2, "count=2");
            });

            client.truncate();

            check.in("after another truncate", check => {
                check.equals(state.counter, 10, "state=10");
                check.equals(log.count(), 2, "count=2");
            });
        })

        test.acase("plays the log continuously", async check => {
            let log = new DiffLog<TestState>();
            let state = new TestState();
            let client = new DiffLogClient(state, log);

            let inter: number[] = [];
            let promise = client.play(diff => {
                inter.push((<any>diff).value);
                return Promise.resolve();
            });

            log.add(new TestDiff(5));
            log.add(new TestDiff(-1));
            log.add(new TestDiff(2));
            client.stop(false);

            await promise;

            check.equals(state.counter, 6);
            check.equals(inter, [5, -1, 2]);
        })
    })
}