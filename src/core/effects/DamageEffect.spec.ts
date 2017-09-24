module TK.SpaceTac.Specs {
    describe("DamageEffect", function () {
        it("applies damage and wear", function () {
            var ship = new Ship();

            TestTools.setShipHP(ship, 150, 400);
            let hull = ship.listEquipment(SlotType.Hull)[0];
            let shield = ship.listEquipment(SlotType.Shield)[0];
            ship.restoreHealth();

            expect(ship.getValue("hull")).toEqual(150);
            expect(ship.getValue("shield")).toEqual(400);
            expect(hull.wear).toBe(0);
            expect(shield.wear).toBe(0);

            new DamageEffect(50).applyOnShip(ship, ship);
            expect(ship.getValue("hull")).toEqual(150);
            expect(ship.getValue("shield")).toEqual(350);
            expect(hull.wear).toBe(0);
            expect(shield.wear).toBe(1);

            new DamageEffect(250).applyOnShip(ship, ship);
            expect(ship.getValue("hull")).toEqual(150);
            expect(ship.getValue("shield")).toEqual(100);
            expect(hull.wear).toBe(0);
            expect(shield.wear).toBe(4);

            new DamageEffect(201).applyOnShip(ship, ship);
            expect(ship.getValue("hull")).toEqual(49);
            expect(ship.getValue("shield")).toEqual(0);
            expect(hull.wear).toBe(2);
            expect(shield.wear).toBe(5);
            expect(ship.alive).toBe(true);

            new DamageEffect(8000).applyOnShip(ship, ship);
            expect(ship.getValue("hull")).toEqual(0);
            expect(ship.getValue("shield")).toEqual(0);
            expect(hull.wear).toBe(3);
            expect(shield.wear).toBe(5);
            expect(ship.alive).toBe(false);
        });

        it("gets a textual description", function () {
            expect(new DamageEffect(10).getDescription()).toEqual("do 10 damage");
            expect(new DamageEffect(10, 5).getDescription()).toEqual("do 10-15 damage");
        });

        it("applies damage modifiers", function () {
            let ship = new Ship();
            TestTools.setShipHP(ship, 1000, 1000);
            let damage = new DamageEffect(200);

            expect(damage.getEffectiveDamage(ship)).toEqual([200, 0]);

            spyOn(ship, "ieffects").and.returnValues(
                isingle(new DamageModifierEffect(-15)),
                isingle(new DamageModifierEffect(20)),
                isingle(new DamageModifierEffect(-150)),
                isingle(new DamageModifierEffect(180)),
                iarray([new DamageModifierEffect(10), new DamageModifierEffect(-15)]),
                isingle(new DamageModifierEffect(3))
            );

            expect(damage.getEffectiveDamage(ship)).toEqual([170, 0]);
            expect(damage.getEffectiveDamage(ship)).toEqual([240, 0]);
            expect(damage.getEffectiveDamage(ship)).toEqual([0, 0]);
            expect(damage.getEffectiveDamage(ship)).toEqual([400, 0]);
            expect(damage.getEffectiveDamage(ship)).toEqual([190, 0]);

            damage = new DamageEffect(40);
            expect(damage.getEffectiveDamage(ship)).toEqual([41, 0]);
        });
    });
}
