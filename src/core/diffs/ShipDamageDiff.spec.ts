module TK.SpaceTac.Specs {
    testing("ShipDamageDiff", test => {
        test.case("applies and reverts", check => {
            let battle = TestTools.createBattle();
            let ship = battle.play_order[0];
            let [hull, shield] = TestTools.setShipHP(ship, 80, 100);

            TestTools.diffChain(check, battle, [
                new ShipDamageDiff(ship, 0, 10),
                new ShipDamageDiff(ship, 19, 0),
                new ShipDamageDiff(ship, 30, 90),
            ], [
                    check => {
                        check.equals(hull.wear, 0, "hull wear");
                        check.equals(shield.wear, 0, "shield wear");
                        check.equals(ship.getValue("hull"), 80, "hull value");
                        check.equals(ship.getValue("shield"), 100, "shield value");
                    },
                    check => {
                        check.equals(hull.wear, 0, "hull wear");
                        check.equals(shield.wear, 1, "shield wear");
                        check.equals(ship.getValue("hull"), 80, "hull value");
                        check.equals(ship.getValue("shield"), 100, "shield value");
                    },
                    check => {
                        check.equals(hull.wear, 2, "hull wear");
                        check.equals(shield.wear, 1, "shield wear");
                        check.equals(ship.getValue("hull"), 80, "hull value");
                        check.equals(ship.getValue("shield"), 100, "shield value");
                    },
                    check => {
                        check.equals(hull.wear, 5, "hull wear");
                        check.equals(shield.wear, 10, "shield wear");
                        check.equals(ship.getValue("hull"), 80, "hull value");
                        check.equals(ship.getValue("shield"), 100, "shield value");
                    },
                ]);
        });
    });
}