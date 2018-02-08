module TK.SpaceTac.Specs {
    testing("ShipMoveDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            check.equals(ship.location, new ArenaLocationAngle(0, 0, 0));

            let engine = new MoveAction();
            let event = new ShipMoveDiff(ship, ship.location, new ArenaLocationAngle(50, 20, 1.2), engine);
            event.apply(battle);
            check.equals(ship.location, new ArenaLocationAngle(50, 20, 1.2));

            event.revert(battle);
            check.equals(ship.location, new ArenaLocationAngle(0, 0, 0));
        });
    });
}