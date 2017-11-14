module TK.SpaceTac {
    testing("AttributeLimitEffect", test => {
        test.case("applies cumulatively on attribute", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            ship.attributes.precision.addModifier(12);
            check.equals(ship.getAttribute("precision"), 12, "initial");

            let effect1 = new AttributeLimitEffect("precision", 5);
            battle.applyDiffs(effect1.getOnDiffs(ship, ship));
            check.equals(ship.getAttribute("precision"), 5, "applied 1");

            let effect2 = new AttributeLimitEffect("precision", 3);
            battle.applyDiffs(effect2.getOnDiffs(ship, ship));
            check.equals(ship.getAttribute("precision"), 3, "applied 2");

            battle.applyDiffs(effect1.getOffDiffs(ship, ship));
            check.equals(ship.getAttribute("precision"), 3, "reverted 1");

            battle.applyDiffs(effect2.getOffDiffs(ship, ship));
            check.equals(ship.getAttribute("precision"), 12, "reverted 2");
        });

        test.case("has a description", check => {
            let effect = new AttributeLimitEffect("power_capacity", 4);
            check.equals(effect.getDescription(), "limit power capacity to 4");
        });
    });
}
