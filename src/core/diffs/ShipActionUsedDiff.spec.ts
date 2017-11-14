module TK.SpaceTac.Specs {
    testing("ShipActionUsedDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            let generator = TestTools.setShipAP(ship, 10);
            let weapon = TestTools.addWeapon(ship, 50, 3, 10, 20);
            weapon.cooldown.configure(2, 1);

            TestTools.diffChain(check, battle, [
                new ShipActionUsedDiff(ship, nn(weapon.action), Target.newFromShip(ship)),
                new ShipActionUsedDiff(ship, nn(weapon.action), Target.newFromShip(ship)),
            ], [
                    check => {
                        check.equals(weapon.cooldown.getRemainingUses(), 2, "cooldown");
                        check.equals(weapon.wear, 0, "weapon wear");
                        check.equals(generator.wear, 0, "generator wear");
                    },
                    check => {
                        check.equals(weapon.cooldown.getRemainingUses(), 1, "cooldown");
                        check.equals(weapon.wear, 1, "weapon wear");
                        check.equals(generator.wear, 1, "generator wear");
                    },
                    check => {
                        check.equals(weapon.cooldown.getRemainingUses(), 0, "cooldown");
                        check.equals(weapon.wear, 2, "weapon wear");
                        check.equals(generator.wear, 2, "generator wear");
                    },
                ]);
        });
    });
}