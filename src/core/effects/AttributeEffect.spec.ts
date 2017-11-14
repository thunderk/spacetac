module TK.SpaceTac {
    testing("AttributeEffect", test => {
        test.case("applies cumulatively on attribute", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            check.equals(ship.getAttribute("maneuvrability"), 0, "initial");

            let effect1 = new AttributeEffect("maneuvrability", 20);
            battle.applyDiffs(effect1.getOnDiffs(ship, ship));
            check.equals(ship.getAttribute("maneuvrability"), 20, "applied 1");

            let effect2 = new AttributeEffect("maneuvrability", 10);
            battle.applyDiffs(effect2.getOnDiffs(ship, ship));
            check.equals(ship.getAttribute("maneuvrability"), 30, "applied 2");

            battle.applyDiffs(effect1.getOffDiffs(ship, ship));
            check.equals(ship.getAttribute("maneuvrability"), 10, "reverted 1");

            battle.applyDiffs(effect2.getOffDiffs(ship, ship));
            check.equals(ship.getAttribute("maneuvrability"), 0, "reverted 2");
        });

        test.case("has a description", check => {
            let effect = new AttributeEffect("maneuvrability", 12);
            check.equals(effect.getDescription(), "maneuvrability +12");

            effect = new AttributeEffect("shield_capacity", -4);
            check.equals(effect.getDescription(), "shield capacity -4");
        });
    });
}
