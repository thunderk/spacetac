/// <reference path="../../common/Testing.ts" />

module TK.SpaceTac.Specs {
    testing("ShipValueDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            TestTools.diffChain(check, battle, [
                new ShipValueDiff(ship, "hull", 15),
                new ShipValueDiff(ship, "hull", -7)
            ], [
                    check => {
                        check.equals(ship.getValue("hull"), 0, "hull value");
                    },
                    check => {
                        check.equals(ship.getValue("hull"), 15, "hull value");
                    },
                    check => {
                        check.equals(ship.getValue("hull"), 8, "hull value");
                    },
                ])
        });
    });
}