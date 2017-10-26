module TK.SpaceTac {
    testing("ValueEffect", test => {
        test.case("adds an amount to a ship value", check => {
            let effect = new ValueEffect("shield", 20);

            let ship = new Ship();
            ship.values.shield.setMaximal(80);
            ship.setValue("shield", 55);
            check.equals(ship.values.shield.get(), 55);

            effect.applyOnShip(ship, ship);
            check.equals(ship.values.shield.get(), 75);

            effect.applyOnShip(ship, ship);
            check.equals(ship.values.shield.get(), 80);
        });

        test.case("has a description", check => {
            let effect = new ValueEffect("power", 12);
            check.equals(effect.getDescription(), "power +12");

            effect = new ValueEffect("power", -4);
            check.equals(effect.getDescription(), "power -4");
        });
    });
}
