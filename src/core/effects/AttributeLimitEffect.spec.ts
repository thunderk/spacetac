module TK.SpaceTac {
    testing("AttributeLimitEffect", test => {
        test.case("applies cumulatively on attribute", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            ship.attributes.evasion.addModifier(12);
            check.equals(ship.getAttribute("evasion"), 12, "initial");

            let effect1 = new AttributeLimitEffect("evasion", 5);
            battle.applyDiffs(effect1.getOnDiffs(ship, ship));
            check.equals(ship.getAttribute("evasion"), 5, "applied 1");

            let effect2 = new AttributeLimitEffect("evasion", 3);
            battle.applyDiffs(effect2.getOnDiffs(ship, ship));
            check.equals(ship.getAttribute("evasion"), 3, "applied 2");

            battle.applyDiffs(effect1.getOffDiffs(ship));
            check.equals(ship.getAttribute("evasion"), 3, "reverted 1");

            battle.applyDiffs(effect2.getOffDiffs(ship));
            check.equals(ship.getAttribute("evasion"), 12, "reverted 2");
        });

        test.case("has a description", check => {
            let effect = new AttributeLimitEffect("power_capacity", 4);
            check.equals(effect.getDescription(), "limit power capacity to 4");
        });
    });
}
