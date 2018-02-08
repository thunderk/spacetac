module TK.SpaceTac.Specs {
    testing("DamageEffect", test => {
        test.case("applies damage", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            TestTools.setShipModel(ship, 150, 400);

            function checkValues(desc: string, hull_value: number, shield_value: number) {
                check.in(desc, check => {
                    check.equals(ship.getValue("hull"), hull_value, "hull value");
                    check.equals(ship.getValue("shield"), shield_value, "shield value");
                });
            }

            checkValues("initial", 150, 400);

            battle.applyDiffs(new DamageEffect(50).getOnDiffs(ship, ship, 1));
            checkValues("after 50 damage", 150, 350);

            battle.applyDiffs(new DamageEffect(250).getOnDiffs(ship, ship, 1));
            checkValues("after 250 damage", 150, 100);

            battle.applyDiffs(new DamageEffect(201).getOnDiffs(ship, ship, 1));
            checkValues("after 201 damage", 49, 0);

            battle.applyDiffs(new DamageEffect(8000).getOnDiffs(ship, ship, 1));
            checkValues("after 8000 damage", 0, 0);
        });

        test.case("gets a textual description", check => {
            check.equals(new DamageEffect(10).getDescription(), "do 10 damage");
            check.equals(new DamageEffect(10, 5).getDescription(), "do 10-15 damage");
        });

        test.case("applies damage modifiers", check => {
            let ship = new Ship();
            TestTools.setShipModel(ship, 1000, 1000);
            let damage = new DamageEffect(200);

            check.equals(damage.getEffectiveDamage(ship, 1), new ShipDamageDiff(ship, 0, 200));

            check.patch(ship, "ieffects", iterator([
                isingle(new DamageModifierEffect(-15)),
                isingle(new DamageModifierEffect(20)),
                isingle(new DamageModifierEffect(-150)),
                isingle(new DamageModifierEffect(180)),
                iarray([new DamageModifierEffect(10), new DamageModifierEffect(-15)]),
                isingle(new DamageModifierEffect(3))
            ]));

            check.equals(damage.getEffectiveDamage(ship, 1), new ShipDamageDiff(ship, 0, 170));
            check.equals(damage.getEffectiveDamage(ship, 1), new ShipDamageDiff(ship, 0, 240));
            check.equals(damage.getEffectiveDamage(ship, 1), new ShipDamageDiff(ship, 0, 0));
            check.equals(damage.getEffectiveDamage(ship, 1), new ShipDamageDiff(ship, 0, 400));
            check.equals(damage.getEffectiveDamage(ship, 1), new ShipDamageDiff(ship, 0, 190));

            damage = new DamageEffect(40);
            check.equals(damage.getEffectiveDamage(ship, 1), new ShipDamageDiff(ship, 0, 41));
        });
    });
}
