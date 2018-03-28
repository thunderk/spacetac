module TK.SpaceTac.Specs {
    testing("DamageEffect", test => {
        test.case("computes shield and hull damage, according to mode", check => {
            let ship = new Ship();
            TestTools.setShipModel(ship, 2, 3);

            check.equals(new DamageEffect(1, DamageEffectMode.HULL_ONLY).getEffectiveDamage(ship), new ShipDamageDiff(ship, 1, 0, 0, 1), "hull 1");
            check.equals(new DamageEffect(3, DamageEffectMode.HULL_ONLY).getEffectiveDamage(ship), new ShipDamageDiff(ship, 2, 0, 0, 3), "hull 3");

            check.equals(new DamageEffect(1, DamageEffectMode.SHIELD_ONLY).getEffectiveDamage(ship), new ShipDamageDiff(ship, 0, 1, 0, 1), "shield 1");
            check.equals(new DamageEffect(4, DamageEffectMode.SHIELD_ONLY).getEffectiveDamage(ship), new ShipDamageDiff(ship, 0, 3, 0, 4), "shield 4");

            check.equals(new DamageEffect(1, DamageEffectMode.SHIELD_THEN_HULL).getEffectiveDamage(ship), new ShipDamageDiff(ship, 0, 1, 0, 1), "piercing 1");
            check.equals(new DamageEffect(4, DamageEffectMode.SHIELD_THEN_HULL).getEffectiveDamage(ship), new ShipDamageDiff(ship, 1, 3, 0, 4), "piercing 4");
            check.equals(new DamageEffect(8, DamageEffectMode.SHIELD_THEN_HULL).getEffectiveDamage(ship), new ShipDamageDiff(ship, 2, 3, 0, 8), "piercing 8");

            check.equals(new DamageEffect(1, DamageEffectMode.SHIELD_OR_HULL).getEffectiveDamage(ship), new ShipDamageDiff(ship, 0, 1, 0, 1), "normal 1");
            check.equals(new DamageEffect(4, DamageEffectMode.SHIELD_OR_HULL).getEffectiveDamage(ship), new ShipDamageDiff(ship, 0, 3, 0, 4), "normal 4");
            ship.setValue("shield", 0);
            check.equals(new DamageEffect(1, DamageEffectMode.SHIELD_OR_HULL).getEffectiveDamage(ship), new ShipDamageDiff(ship, 1, 0, 0, 1), "normal no shield 1");
            check.equals(new DamageEffect(4, DamageEffectMode.SHIELD_OR_HULL).getEffectiveDamage(ship), new ShipDamageDiff(ship, 2, 0, 0, 4), "normal no shield 4");

            ship.setValue("shield", 3);
            TestTools.setAttribute(ship, "evasion", 1);
            check.equals(new DamageEffect(5, DamageEffectMode.SHIELD_THEN_HULL).getEffectiveDamage(ship), new ShipDamageDiff(ship, 1, 3, 1, 5), "piercing 5 evade 1");
        });

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

            battle.applyDiffs(new DamageEffect(50, DamageEffectMode.SHIELD_THEN_HULL).getOnDiffs(ship, ship));
            checkValues("after 50 damage", 150, 350);

            battle.applyDiffs(new DamageEffect(250, DamageEffectMode.SHIELD_THEN_HULL).getOnDiffs(ship, ship));
            checkValues("after 250 damage", 150, 100);

            battle.applyDiffs(new DamageEffect(201, DamageEffectMode.SHIELD_THEN_HULL).getOnDiffs(ship, ship));
            checkValues("after 201 damage", 49, 0);

            battle.applyDiffs(new DamageEffect(8000, DamageEffectMode.SHIELD_THEN_HULL).getOnDiffs(ship, ship));
            checkValues("after 8000 damage", 0, 0);
        });

        test.case("gets a textual description", check => {
            check.equals(new DamageEffect(10).getDescription(), "do 10 damage");
            check.equals(new DamageEffect(10, DamageEffectMode.HULL_ONLY).getDescription(), "do 10 hull damage");
            check.equals(new DamageEffect(10, DamageEffectMode.SHIELD_ONLY).getDescription(), "do 10 shield damage");
            check.equals(new DamageEffect(10, DamageEffectMode.SHIELD_THEN_HULL).getDescription(), "do 10 piercing damage");
            check.equals(new DamageEffect(10, DamageEffectMode.SHIELD_ONLY, false).getDescription(), "do 10 unevadable shield damage");
        });
    });
}
