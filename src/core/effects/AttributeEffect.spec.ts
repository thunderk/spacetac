module TK.SpaceTac {
    testing("AttributeEffect", test => {
        test.case("is not applied directly", check => {
            let ship = new Ship();
            check.equals(ship.getAttribute("maneuvrability"), 0);

            let effect = new AttributeEffect("maneuvrability", 20);
            effect.applyOnShip(ship, ship);
            check.equals(ship.getAttribute("maneuvrability"), 0);

            ship.sticky_effects.push(new StickyEffect(effect, 2));
            ship.updateAttributes();
            check.equals(ship.getAttribute("maneuvrability"), 20);
        });

        test.case("has a description", check => {
            let effect = new AttributeEffect("maneuvrability", 12);
            check.equals(effect.getDescription(), "maneuvrability +12");

            effect = new AttributeEffect("shield_capacity", -4);
            check.equals(effect.getDescription(), "shield capacity -4");
        });
    });
}
