module TK.SpaceTac.Specs {
    testing("EndBattleDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();

            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[1].addShip();

            battle.start();

            TestTools.diffChain(check, battle, [
                new EndBattleDiff(battle.fleets[1], 4)
            ], [
                    check => {
                        check.equals(battle.ended, false, "battle is ongoing");
                        check.equals(battle.outcome, null, "battle has no outcome");
                    },
                    check => {
                        check.equals(battle.ended, true, "battle is ended");
                        check.same(nn(battle.outcome).winner, battle.fleets[1], "battle has an outcome");
                    },
                ]);
        });
    });
}