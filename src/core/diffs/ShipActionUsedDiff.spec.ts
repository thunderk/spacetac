module TK.SpaceTac.Specs {
    testing("ShipActionUsedDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            let generator = TestTools.setShipModel(ship, 100, 0, 10);
            let weapon = TestTools.addWeapon(ship, 50, 3, 10, 20);
            weapon.configureCooldown(2, 1);
            let cooldown = ship.actions.getCooldown(weapon);

            TestTools.diffChain(check, battle, [
                new ShipActionUsedDiff(ship, weapon, Target.newFromShip(ship)),
                new ShipActionUsedDiff(ship, weapon, Target.newFromShip(ship)),
            ], [
                    check => {
                        check.equals(cooldown.getRemainingUses(), 2, "cooldown");
                    },
                    check => {
                        check.equals(cooldown.getRemainingUses(), 1, "cooldown");
                    },
                    check => {
                        check.equals(cooldown.getRemainingUses(), 0, "cooldown");
                    },
                ]);
        });
    });
}