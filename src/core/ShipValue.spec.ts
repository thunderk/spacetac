module TK.SpaceTac {
    testing("ShipAttribute", test => {
        test.case("applies cumulative, multiplier and limit", check => {
            let attribute = new ShipAttribute();
            check.equals(attribute.get(), 0, "initial");

            attribute.addModifier(4);
            check.in("+4", check => {
                check.equals(attribute.get(), 4, "effective value");
            });

            attribute.addModifier(2);
            check.in("+4 +2", check => {
                check.equals(attribute.get(), 6, "effective value");
            });

            attribute.addModifier(undefined, 20);
            check.in("+4 +2 +20%", check => {
                check.equals(attribute.get(), 7, "effective value");
            });

            attribute.addModifier(undefined, 5);
            check.in("+4 +2 +20% +5%", check => {
                check.equals(attribute.get(), 8, "effective value");
                check.equals(attribute.getMaximal(), Infinity, "maximal value");
            });

            attribute.addModifier(undefined, undefined, 6);
            check.in("+4 +2 +20% +5% lim6", check => {
                check.equals(attribute.get(), 6, "effective value");
                check.equals(attribute.getMaximal(), 6, "maximal value");
            });

            attribute.addModifier(undefined, undefined, 4);
            check.in("+4 +2 +20% +5% lim6 lim4", check => {
                check.equals(attribute.get(), 4, "effective value");
                check.equals(attribute.getMaximal(), 4, "maximal value");
            });

            attribute.addModifier(undefined, undefined, 10);
            check.in("+4 +2 +20% +5% lim6 lim4 lim10", check => {
                check.equals(attribute.get(), 4, "effective value");
                check.equals(attribute.getMaximal(), 4, "maximal value");
            });
        });
    });
}
