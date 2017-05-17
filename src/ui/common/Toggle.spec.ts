/// <reference path="../TestGame.ts"/>

module TS.SpaceTac.UI.Specs {
    describe("Toggle", function () {
        let on_calls = 0;
        let off_calls = 0;

        beforeEach(function () {
            on_calls = 0;
            off_calls = 0;
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        function newToggle(): Toggle {
            return new Toggle(() => on_calls++, () => off_calls++);
        }

        function check(on: number, off: number) {
            expect(on_calls).toBe(on);
            expect(off_calls).toBe(off);
            on_calls = 0;
            off_calls = 0;
        }

        it("handles simple toggling", function () {
            let toggle = newToggle();
            check(0, 0);

            toggle.start();
            check(1, 0);

            jasmine.clock().tick(10000000);
            check(0, 0);

            toggle.stop();
            check(0, 1);

            jasmine.clock().tick(10000000);
            check(0, 0);

            toggle.stop();
            check(0, 0);

            toggle.start();
            check(1, 0);
        });

        it("applies hard priority", function () {
            let toggle = newToggle();
            check(0, 0);

            // hard
            toggle.start(0, true);
            check(1, 0);

            toggle.stop(false);
            check(0, 0);

            toggle.stop(true);
            check(0, 1);

            // soft
            toggle.start(0, false);
            check(1, 0);

            toggle.stop(true);
            check(0, 1);

            // soft lifted to hard
            toggle.start(0, false);
            check(1, 0);

            toggle.start(0, true);
            check(0, 0);

            toggle.stop(false);
            check(0, 0);

            toggle.stop(true);
            check(0, 1);
        });

        it("automatically stop after a duration", function () {
            let toggle = newToggle();
            check(0, 0);

            toggle.start(10);
            check(1, 0);

            jasmine.clock().tick(9);
            check(0, 0);

            jasmine.clock().tick(2);
            check(0, 1);

            toggle.stop();
            check(0, 0);

            toggle.start();
            check(1, 0);
        });
    });
}