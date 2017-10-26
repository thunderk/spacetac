/// <reference path="events/BaseBattleEvent.ts"/>

module TK.SpaceTac {
    testing("BattleLog", test => {
        // Check a single game log event
        function checkEvent(got: BaseBattleEvent, ship: Ship, code: string,
            target_ship: Ship | null = null, target_x: number | null = null, target_y: number | null = null): void {
            if (target_ship) {
                if (target_x === null) {
                    target_x = target_ship.arena_x;
                }
                if (target_y === null) {
                    target_y = target_ship.arena_y;
                }
            }

            let check = test.check;
            check.same(got.ship, ship);
            check.equals(got.code, code);
            if (got.target) {
                check.same(got.target.ship, target_ship);
                if (target_x === null) {
                    check.equals(got.target.x, null);
                } else {
                    check.nears(got.target.x, target_x);
                }
                if (target_y === null) {
                    check.equals(got.target.y, null);
                } else {
                    check.nears(got.target.y, target_y);
                }
            } else if (target_ship || target_x || target_y) {
                check.fail("Got no target");
            }
        }

        // Fake event
        class FakeEvent extends BaseBattleEvent {
            constructor() {
                super("fake", new Ship());
            }
        }

        test.case("forwards events to subscribers, until unsubscribe", check => {
            var log = new BattleLog();
            var received: BaseBattleEvent[] = [];
            var fake = new FakeEvent();

            var sub = log.subscribe(function (event: BaseBattleEvent) {
                received.push(event);
            });

            log.add(fake);
            check.equals(received, [fake]);

            log.add(fake);
            check.equals(received, [fake, fake]);

            log.unsubscribe(sub);
            log.add(fake);
            check.equals(received, [fake, fake]);
        });

        test.case("logs ship change events", check => {
            var battle = Battle.newQuickRandom();
            battle.log.clear();
            battle.log.addFilter("value");
            check.equals(battle.log.events.length, 0);

            battle.advanceToNextShip();
            check.equals(battle.log.events.length, 1);
            checkEvent(battle.log.events[0], battle.play_order[0], "ship_change", battle.play_order[1]);
        });

        test.case("can receive simulated initial state events", check => {
            let battle = Battle.newQuickRandom(true, 1, 4);
            let playing = nn(battle.playing_ship);

            let result = battle.getBootstrapEvents();
            check.equals(result.length, 17);
            for (var i = 0; i < 8; i++) {
                checkEvent(result[i], battle.play_order[i], "move", null,
                    battle.play_order[i].arena_x, battle.play_order[i].arena_y);
            }
            for (var i = 0; i < 8; i++) {
                checkEvent(result[8 + i], battle.play_order[i], "activeeffects");
            }
            checkEvent(result[16], playing, "ship_change", playing);
        });

        test.case("stop accepting events once the battle is ended", check => {
            let log = new BattleLog();

            log.add(new ValueChangeEvent(new Ship(), new ShipValue("test"), 1));
            log.add(new EndBattleEvent(new BattleOutcome(null)));
            log.add(new ShipChangeEvent(new Ship(), new Ship()));

            check.equals(log.events.length, 2);
            check.equals(log.events[0] instanceof ValueChangeEvent, true);
            check.equals(log.events[1] instanceof EndBattleEvent, true);
        });
    });
}
