module TK.SpaceTac {
    testing("AttributeEffect", test => {
        test.case("applies cumulatively on attribute", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            check.equals(ship.getAttribute("evasion"), 0, "initial");

            let effect1 = new AttributeEffect("evasion", 20);
            battle.applyDiffs(effect1.getOnDiffs(ship, ship));
            check.equals(ship.getAttribute("evasion"), 20, "applied 1");

            let effect2 = new AttributeEffect("evasion", 10);
            battle.applyDiffs(effect2.getOnDiffs(ship, ship));
            check.equals(ship.getAttribute("evasion"), 30, "applied 2");

            battle.applyDiffs(effect1.getOffDiffs(ship));
            check.equals(ship.getAttribute("evasion"), 10, "reverted 1");

            battle.applyDiffs(effect2.getOffDiffs(ship));
            check.equals(ship.getAttribute("evasion"), 0, "reverted 2");
        });

        test.case("has a description", check => {
            let effect = new AttributeEffect("evasion", 12);
            check.equals(effect.getDescription(), "evasion +12");

            effect = new AttributeEffect("shield_capacity", -4);
            check.equals(effect.getDescription(), "shield capacity -4");
        });
    });
}
