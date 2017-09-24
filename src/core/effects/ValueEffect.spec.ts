module TK.SpaceTac {
    describe("ValueEffect", function () {
        it("adds an amount to a ship value", function () {
            let effect = new ValueEffect("shield", 20);

            let ship = new Ship();
            ship.values.shield.setMaximal(80);
            ship.setValue("shield", 55);
            expect(ship.values.shield.get()).toEqual(55);

            effect.applyOnShip(ship, ship);
            expect(ship.values.shield.get()).toEqual(75);

            effect.applyOnShip(ship, ship);
            expect(ship.values.shield.get()).toEqual(80);
        });

        it("has a description", function () {
            let effect = new ValueEffect("power", 12);
            expect(effect.getDescription()).toEqual("power +12");

            effect = new ValueEffect("power", -4);
            expect(effect.getDescription()).toEqual("power -4");
        });
    });
}
