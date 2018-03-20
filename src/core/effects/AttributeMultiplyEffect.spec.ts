module TK.SpaceTac {
    testing("AttributeMultiplyEffect", test => {
        test.case("boosts or reduces cumulatively an attribute", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            ship.attributes.hull_capacity.addModifier(100);
            check.equals(ship.getAttribute("hull_capacity"), 100, "initial");

            let effect1 = new AttributeMultiplyEffect("hull_capacity", 30);
            battle.applyDiffs(effect1.getOnDiffs(ship, ship));
            check.equals(ship.getAttribute("hull_capacity"), 130, "applied 1");

            let effect2 = new AttributeMultiplyEffect("hull_capacity", -10);
            battle.applyDiffs(effect2.getOnDiffs(ship, ship));
            check.equals(ship.getAttribute("hull_capacity"), 120, "applied 2");

            battle.applyDiffs(effect1.getOffDiffs(ship));
            check.equals(ship.getAttribute("hull_capacity"), 90, "reverted 1");

            battle.applyDiffs(effect2.getOffDiffs(ship));
            check.equals(ship.getAttribute("hull_capacity"), 100, "reverted 2");
        });

        test.case("has a description", check => {
            let effect = new AttributeMultiplyEffect("power_capacity", 20);
            check.equals(effect.getDescription(), "power capacity +20%");
        });
    });
}
