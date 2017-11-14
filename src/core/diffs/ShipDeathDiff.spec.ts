/// <reference path="../../common/Testing.ts" />

module TK.SpaceTac.Specs {
    testing("ShipDeathDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[0].addShip();
            let ship3 = battle.fleets[1].addShip();
            battle.play_order = [ship3, ship2, ship1];

            TestTools.diffChain(check, battle, [
                new ShipDeathDiff(battle, ship2)
            ], [
                    check => {
                        check.equals(ship2.alive, true, "alive");
                        check.equals(imaterialize(battle.iships(false)), [ship1, ship2, ship3], "in all ships");
                        check.equals(imaterialize(battle.iships(true)), [ship1, ship2, ship3], "in alive ships");
                        check.equals(battle.fleets[0].ships, [ship1, ship2], "fleet1");
                        check.equals(battle.fleets[1].ships, [ship3], "fleet2");
                        check.equals(battle.play_order, [ship3, ship2, ship1], "in play order");
                    },
                    check => {
                        check.equals(ship2.alive, false, "dead");
                        check.equals(imaterialize(battle.iships(false)), [ship1, ship2, ship3], "in all ships");
                        check.equals(imaterialize(battle.iships(true)), [ship1, ship3], "not in alive ships anymore");
                        check.equals(battle.fleets[0].ships, [ship1, ship2], "fleet1");
                        check.equals(battle.fleets[1].ships, [ship3], "fleet2");
                        check.equals(battle.play_order, [ship3, ship1], "removed from play order");
                    },
                ]);
        });
    });
}