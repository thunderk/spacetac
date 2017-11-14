module TK.SpaceTac.Specs {
    testing("ShipChangeDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();
            let attacker1 = battle.fleets[0].addShip();
            let attacker2 = battle.fleets[0].addShip();
            let defender1 = battle.fleets[1].addShip();
            battle.play_order = [defender1, attacker2, attacker1];
            battle.play_index = 0;
            battle.cycle = 1;

            TestTools.diffChain(check, battle, [
                new ShipChangeDiff(battle.play_order[0], battle.play_order[1]),
                new ShipChangeDiff(battle.play_order[1], battle.play_order[2]),
                new ShipChangeDiff(battle.play_order[2], battle.play_order[0], 1),
            ], [
                    check => {
                        check.same(battle.playing_ship, defender1, "first ship playing");
                        check.equals(battle.cycle, 1, "first cycle");
                    },
                    check => {
                        check.same(battle.playing_ship, attacker2, "second ship playing");
                        check.equals(battle.cycle, 1, "first cycle");
                    },
                    check => {
                        check.same(battle.playing_ship, attacker1, "third ship playing");
                        check.equals(battle.cycle, 1, "first cycle");
                    },
                    check => {
                        check.same(battle.playing_ship, defender1, "first ship playing again");
                        check.equals(battle.cycle, 2, "second cycle");
                    },
                ]);
        });
    });
}