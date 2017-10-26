module TK.SpaceTac.Specs {
    testing("DamageEffect", test => {
        test.case("applies damage and wear", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            TestTools.setShipHP(ship, 150, 400);
            let hull = ship.listEquipment(SlotType.Hull)[0];
            let shield = ship.listEquipment(SlotType.Shield)[0];
            ship.restoreHealth();

            check.equals(ship.getValue("hull"), 150);
            check.equals(ship.getValue("shield"), 400);
            check.equals(hull.wear, 0);
            check.equals(shield.wear, 0);

            new DamageEffect(50).applyOnShip(ship, ship);
            check.equals(ship.getValue("hull"), 150);
            check.equals(ship.getValue("shield"), 350);
            check.equals(hull.wear, 0);
            check.equals(shield.wear, 1);

            new DamageEffect(250).applyOnShip(ship, ship);
            check.equals(ship.getValue("hull"), 150);
            check.equals(ship.getValue("shield"), 100);
            check.equals(hull.wear, 0);
            check.equals(shield.wear, 4);

            new DamageEffect(201).applyOnShip(ship, ship);
            check.equals(ship.getValue("hull"), 49);
            check.equals(ship.getValue("shield"), 0);
            check.equals(hull.wear, 2);
            check.equals(shield.wear, 5);
            check.equals(ship.alive, true);

            new DamageEffect(8000).applyOnShip(ship, ship);
            check.equals(ship.getValue("hull"), 0);
            check.equals(ship.getValue("shield"), 0);
            check.equals(hull.wear, 3);
            check.equals(shield.wear, 5);
            check.equals(ship.alive, false);
        });

        test.case("gets a textual description", check => {
            check.equals(new DamageEffect(10).getDescription(), "do 10 damage");
            check.equals(new DamageEffect(10, 5).getDescription(), "do 10-15 damage");
        });

        test.case("applies damage modifiers", check => {
            let ship = new Ship();
            TestTools.setShipHP(ship, 1000, 1000);
            let damage = new DamageEffect(200);

            check.equals(damage.getEffectiveDamage(ship), [200, 0]);

            spyOn(ship, "ieffects").and.returnValues(
                isingle(new DamageModifierEffect(-15)),
                isingle(new DamageModifierEffect(20)),
                isingle(new DamageModifierEffect(-150)),
                isingle(new DamageModifierEffect(180)),
                iarray([new DamageModifierEffect(10), new DamageModifierEffect(-15)]),
                isingle(new DamageModifierEffect(3))
            );

            check.equals(damage.getEffectiveDamage(ship), [170, 0]);
            check.equals(damage.getEffectiveDamage(ship), [240, 0]);
            check.equals(damage.getEffectiveDamage(ship), [0, 0]);
            check.equals(damage.getEffectiveDamage(ship), [400, 0]);
            check.equals(damage.getEffectiveDamage(ship), [190, 0]);

            damage = new DamageEffect(40);
            check.equals(damage.getEffectiveDamage(ship), [41, 0]);
        });
    });
}
