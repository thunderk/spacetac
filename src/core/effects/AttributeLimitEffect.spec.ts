module TK.SpaceTac {
    testing("AttributeLimitEffect", test => {
        test.case("limits an attribute", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            check.equals(ship.getAttribute("shield_capacity"), 0);
            check.equals(ship.getValue("shield"), 0);

            TestTools.setShipHP(ship, 100, 50);
            ship.setValue("shield", 40);
            check.equals(ship.getAttribute("shield_capacity"), 50);
            check.equals(ship.getValue("shield"), 40);

            battle.log.clear();
            let effect = new StickyEffect(new AttributeLimitEffect("shield_capacity", 30));
            ship.addStickyEffect(effect);

            check.equals(ship.getAttribute("shield_capacity"), 30);
            check.equals(ship.getValue("shield"), 30);
            check.equals(battle.log.events, [
                new ActiveEffectsEvent(ship, [new AttributeEffect("hull_capacity", 100), new AttributeEffect("shield_capacity", 50)], [effect]),
                new ValueChangeEvent(ship, new ShipValue("shield", 30, 50), -10),
                new ValueChangeEvent(ship, new ShipAttribute("shield capacity", 30), -20),
            ]);

            ship.cleanStickyEffects();

            check.equals(ship.getAttribute("shield_capacity"), 50);
            check.equals(ship.getValue("shield"), 30);
        });
    });
}
