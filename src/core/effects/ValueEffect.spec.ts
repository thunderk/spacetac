module TK.SpaceTac {
    testing("ValueEffect", test => {
        test.case("adds an amount to a ship value", check => {
            let effect = new ValueEffect("shield", 20);

            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            ship.setValue("shield", 55);
            check.equals(ship.getValue("shield"), 55);

            battle.applyDiffs(effect.getOnDiffs(ship, ship));
            check.equals(ship.getValue("shield"), 75);

            battle.applyDiffs(effect.getOnDiffs(ship, ship));
            check.equals(ship.getValue("shield"), 95);
        });

        test.case("has a description", check => {
            let effect = new ValueEffect("power", 12);
            check.equals(effect.getDescription(), "power +12");

            effect = new ValueEffect("power", -4);
            check.equals(effect.getDescription(), "power -4");
        });
    });
}
