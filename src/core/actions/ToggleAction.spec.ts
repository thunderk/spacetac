module TK.SpaceTac {
    testing("ToggleAction", test => {
        test.case("returns correct targetting mode", check => {
            let action = new ToggleAction(new Equipment(), 1, 0, []);
            check.same(action.getTargettingMode(new Ship()), ActionTargettingMode.SELF_CONFIRM);

            action.activated = true;
            check.same(action.getTargettingMode(new Ship()), ActionTargettingMode.SELF_CONFIRM);

            action = new ToggleAction(new Equipment(), 1, 50, []);
            check.same(action.getTargettingMode(new Ship()), ActionTargettingMode.SURROUNDINGS);

            action.activated = true;
            check.same(action.getTargettingMode(new Ship()), ActionTargettingMode.SELF_CONFIRM);
        })

        test.case("collects impacted ships", check => {
            let action = new ToggleAction(new Equipment(), 1, 50, []);
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            ship1.setArenaPosition(0, 0);
            let ship2 = battle.fleets[0].addShip();
            ship2.setArenaPosition(0, 30);
            let ship3 = battle.fleets[0].addShip();
            ship3.setArenaPosition(0, 60);

            let result = action.getImpactedShips(ship1, Target.newFromShip(ship1));
            check.equals(result, [ship1, ship2]);
        });
    })
}
