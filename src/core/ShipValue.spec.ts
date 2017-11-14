module TK.SpaceTac {
    testing("ShipAttribute", test => {
        test.case("applies cumulative, multiplier and limit", check => {
            let attribute = new ShipAttribute();
            check.equals(attribute.get(), 0, "initial");

            attribute.addModifier(4);
            check.equals(attribute.get(), 4, "added 4");

            attribute.addModifier(2);
            check.equals(attribute.get(), 6, "added 6");

            attribute.addModifier(undefined, 20);
            check.equals(attribute.get(), 7, "added 20%");

            attribute.addModifier(undefined, 5);
            check.equals(attribute.get(), 8, "added 5%");

            attribute.addModifier(undefined, undefined, 6);
            check.equals(attribute.get(), 6, "limited to 6");

            attribute.addModifier(undefined, undefined, 4);
            check.equals(attribute.get(), 4, "limited to 4");

            attribute.addModifier(undefined, undefined, 10);
            check.equals(attribute.get(), 4, "limited to 10");
        });
    });
}
