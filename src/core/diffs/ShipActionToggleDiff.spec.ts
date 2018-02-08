module TK.SpaceTac.Specs {
    testing("ShipActionToggleDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            let generator = TestTools.setShipModel(ship, 100, 0, 10);
            let action = new ToggleAction("testtoggle", { power: 2 });
            ship.actions.addCustom(action);

            TestTools.diffChain(check, battle, [
                new ShipActionToggleDiff(ship, action, true),
                new ShipActionToggleDiff(ship, action, false),
            ], [
                    check => {
                        check.equals(ship.actions.isToggled(action), false, "not activated");
                    },
                    check => {
                        check.equals(ship.actions.isToggled(action), true, "activated");
                    },
                    check => {
                        check.equals(ship.actions.isToggled(action), false, "not activated");
                    },
                ]);
        });
    });
}