module TK.SpaceTac {
    describe("CooldownEffect", function () {
        it("cools down equipment", function () {
            let ship = new Ship();
            let weapons = [TestTools.addWeapon(ship), TestTools.addWeapon(ship), TestTools.addWeapon(ship)];
            weapons.forEach(weapon => weapon.cooldown.configure(1, 3));
            expect(weapons.map(weapon => weapon.cooldown.heat)).toEqual([0, 0, 0]);

            new CooldownEffect(0, 0).applyOnShip(ship, ship);
            expect(weapons.map(weapon => weapon.cooldown.heat)).toEqual([0, 0, 0]);

            weapons.forEach(weapon => weapon.cooldown.use());
            expect(weapons.map(weapon => weapon.cooldown.heat)).toEqual([3, 3, 3]);

            new CooldownEffect(0, 0).applyOnShip(ship, ship);
            expect(weapons.map(weapon => weapon.cooldown.heat)).toEqual([0, 0, 0]);

            weapons.forEach(weapon => weapon.cooldown.use());
            expect(weapons.map(weapon => weapon.cooldown.heat)).toEqual([3, 3, 3]);

            new CooldownEffect(1, 0).applyOnShip(ship, ship);
            expect(weapons.map(weapon => weapon.cooldown.heat)).toEqual([2, 2, 2]);

            new CooldownEffect(1, 2).applyOnShip(ship, ship);
            expect(weapons.map(weapon => weapon.cooldown.heat).sort()).toEqual([1, 1, 2]);
        })

        it("builds a textual description", function () {
            expect(new CooldownEffect(0, 0).getDescription()).toBe("Full cooling (all equipments)");
            expect(new CooldownEffect(1, 1).getDescription()).toBe("1 cooling (1 equipment)");
            expect(new CooldownEffect(2, 2).getDescription()).toBe("2 cooling (2 equipments)");
        })
    })
}
