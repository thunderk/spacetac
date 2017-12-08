module TK.SpaceTac {
    testing("ValueEffect", test => {
        test.case("adds an amount to a ship value", check => {
            let effect = new ValueEffect("shield", 20);

            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            ship.setValue("shield", 55);
            check.equals(ship.getValue("shield"), 55);

            battle.applyDiffs(effect.getOnDiffs(ship, ship, 1));
            check.equals(ship.getValue("shield"), 75);

            battle.applyDiffs(effect.getOnDiffs(ship, ship, 1));
            check.equals(ship.getValue("shield"), 95);
        });

        test.case("estimates if the effect is beneficial", check => {
            let effect = new ValueEffect("hull", 12);
            check.equals(effect.isBeneficial(), true, "12");

            effect = new ValueEffect("hull", -12);
            check.equals(effect.isBeneficial(), false, "-12");

            effect = new ValueEffect("hull", 0, 8);
            check.equals(effect.isBeneficial(), true, "0 8");

            effect = new ValueEffect("hull", 0, -8);
            check.equals(effect.isBeneficial(), false, "0 -8");

            effect = new ValueEffect("hull", 4, -3);
            check.equals(effect.isBeneficial(), true, "4 -3");

            effect = new ValueEffect("hull", 4, -4);
            check.equals(effect.isBeneficial(), true, "4 -4");

            effect = new ValueEffect("hull", 3, -4);
            check.equals(effect.isBeneficial(), false, "3 -4");

            effect = new ValueEffect("hull", -4, 4);
            check.equals(effect.isBeneficial(), false, "-4 4");

            effect = new ValueEffect("hull", 0, 0, 12);
            check.equals(effect.isBeneficial(), true, "0 0 12");

            effect = new ValueEffect("hull", 0, 0, -12);
            check.equals(effect.isBeneficial(), false, "0 0 -12");

            effect = new ValueEffect("hull", 0, 0, 0, 8);
            check.equals(effect.isBeneficial(), true, "0 0 0 8");

            effect = new ValueEffect("hull", 0, 0, 0, -8);
            check.equals(effect.isBeneficial(), false, "0 0 0 -8");

            effect = new ValueEffect("hull", 0, 0, 4, -3);
            check.equals(effect.isBeneficial(), true, "0 0 4 -3");

            effect = new ValueEffect("hull", 0, 0, 4, -4);
            check.equals(effect.isBeneficial(), true, "0 0 4 -4");

            effect = new ValueEffect("hull", 0, 0, 3, -4);
            check.equals(effect.isBeneficial(), false, "0 0 3 -4");

            effect = new ValueEffect("hull", 0, 0, -4, 4);
            check.equals(effect.isBeneficial(), false, "0 0 -4 4");
        });

        test.case("has a description", check => {
            let effect = new ValueEffect("power", 12);
            check.equals(effect.getDescription(), "power +12");

            effect = new ValueEffect("power", -4);
            check.equals(effect.getDescription(), "power -4");

            effect = new ValueEffect("power");
            check.equals(effect.getDescription(), "no effect");

            effect = new ValueEffect("power", 0, -5);
            check.equals(effect.getDescription(), "power -5 when removed");

            effect = new ValueEffect("power", 5, -5);
            check.equals(effect.getDescription(), "power +5 while active");

            effect = new ValueEffect("power", 5, -6);
            check.equals(effect.getDescription(), "power +5 on, -6 off");

            effect = new ValueEffect("power", 0, 0, 6);
            check.equals(effect.getDescription(), "power +6 on turn start");

            effect = new ValueEffect("power", 0, 0, 0, -3);
            check.equals(effect.getDescription(), "power -3 on turn end");

            effect = new ValueEffect("power", 0, 0, 3, -3);
            check.equals(effect.getDescription(), "power +3 during turn");

            effect = new ValueEffect("power", 0, 0, 4, -3);
            check.equals(effect.getDescription(), "power +4 on turn start, -3 on turn end");

            effect = new ValueEffect("power", 1, 2, 3, 4);
            check.equals(effect.getDescription(), "power +1 on, +2 off, +3 on turn start, +4 on turn end");
        });
    });
}
