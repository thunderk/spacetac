module TS.SpaceTac.Game {
    describe("ValueEffect", function () {
        it("adds an amount to a ship value", function () {
            let effect = new ValueEffect("shield", 20);

            let ship = new Ship();
            ship.values.shield.setMaximal(80);
            ship.setValue("shield", 55);
            expect(ship.values.shield.get()).toEqual(55);

            effect.applyOnShip(ship);
            expect(ship.values.shield.get()).toEqual(75);

            effect.applyOnShip(ship);
            expect(ship.values.shield.get()).toEqual(80);
        });
    });
}
