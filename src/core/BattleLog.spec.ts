/// <reference path="events/BaseLogEvent.ts"/>

module TS.SpaceTac {
    // Check a single game log event
    function checkEvent(got: BaseLogEvent, ship: Ship, code: string,
        target_ship: Ship | null = null, target_x: number | null = null, target_y: number | null = null): void {
        if (target_ship) {
            if (target_x === null) {
                target_x = target_ship.arena_x;
            }
            if (target_y === null) {
                target_y = target_ship.arena_y;
            }
        }

        expect(got.ship).toBe(ship);
        expect(got.code).toEqual(code);
        if (got.target) {
            expect(got.target.ship).toBe(target_ship);
            if (target_x === null) {
                expect(got.target.x).toBeNull();
            } else {
                expect(got.target.x).toBeCloseTo(target_x, 0.000001);
            }
            if (target_y === null) {
                expect(got.target.y).toBeNull();
            } else {
                expect(got.target.y).toBeCloseTo(target_y, 0.000001);
            }
        } else {
            fail("Got no target");
        }
    }

    // Fake event
    class FakeEvent extends BaseLogEvent {
        constructor() {
            super("fake", new Ship());
        }
    }

    describe("BattleLog", function () {
        it("forwards events to subscribers, until unsubscribe", function () {
            var log = new BattleLog();
            var received: BaseLogEvent[] = [];
            var fake = new FakeEvent();

            var sub = log.subscribe(function (event: BaseLogEvent) {
                received.push(event);
            });

            log.add(fake);
            expect(received).toEqual([fake]);

            log.add(fake);
            expect(received).toEqual([fake, fake]);

            log.unsubscribe(sub);
            log.add(fake);
            expect(received).toEqual([fake, fake]);
        });

        it("logs ship change events", function () {
            var battle = Battle.newQuickRandom();
            battle.log.clear();
            battle.log.addFilter("value");
            expect(battle.log.events.length).toBe(0);

            battle.advanceToNextShip();
            expect(battle.log.events.length).toBe(1);
            checkEvent(battle.log.events[0], battle.play_order[0], "ship_change", battle.play_order[1]);
        });

        it("can receive simulated initial state events", function () {
            let battle = Battle.newQuickRandom();
            let playing = nn(battle.playing_ship);
            battle.log.clear();
            battle.log.addFilter("value");
            expect(battle.log.events.length).toBe(0);

            battle.injectInitialEvents();

            expect(battle.log.events.length).toBe(9);
            for (var i = 0; i < 8; i++) {
                checkEvent(battle.log.events[i], battle.play_order[i], "move", null,
                    battle.play_order[i].arena_x, battle.play_order[i].arena_y);
            }
            checkEvent(battle.log.events[8], playing, "ship_change", playing);
        });
    });
}
