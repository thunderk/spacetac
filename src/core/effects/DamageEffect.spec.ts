module TS.SpaceTac.Specs {
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

            new DamageEffect(50).applyOnShip(ship);
            expect(ship.getValue("hull")).toEqual(150);
            expect(ship.getValue("shield")).toEqual(350);
            expect(hull.wear).toBe(0);
            expect(shield.wear).toBe(1);

            new DamageEffect(250).applyOnShip(ship);
            expect(ship.getValue("hull")).toEqual(150);
            expect(ship.getValue("shield")).toEqual(100);
            expect(hull.wear).toBe(0);
            expect(shield.wear).toBe(4);

            new DamageEffect(201).applyOnShip(ship);
            expect(ship.getValue("hull")).toEqual(49);
            expect(ship.getValue("shield")).toEqual(0);
            expect(hull.wear).toBe(2);
            expect(shield.wear).toBe(5);
            expect(ship.alive).toBe(true);

            new DamageEffect(8000).applyOnShip(ship);
            expect(ship.getValue("hull")).toEqual(0);
            expect(ship.getValue("shield")).toEqual(0);
            expect(hull.wear).toBe(3);
            expect(shield.wear).toBe(5);
            expect(ship.alive).toBe(false);
        });
    });
}
