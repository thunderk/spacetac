module TK.SpaceTac.Specs {
    testing("ShipActionToggleDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            let generator = TestTools.setShipAP(ship, 10);
            let weapon = TestTools.addWeapon(ship, 50, 3, 10, 20);
            let action = new ToggleAction(weapon, 2);
            weapon.action = action;

            TestTools.diffChain(check, battle, [
                new ShipActionToggleDiff(ship, action, true),
                new ShipActionToggleDiff(ship, action, false),
            ], [
                    check => {
                        check.equals(action.activated, false, "not activated");
                    },
                    check => {
                        check.equals(action.activated, true, "activated");
                    },
                    check => {
                        check.equals(action.activated, false, "not activated");
                    },
                ]);
        });
    });
}