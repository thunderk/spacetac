module TS.SpaceTac.Game {
    describe("AttributeAddEffect", function () {
        it("adds an amount to an attribute value", function () {
            let effect = new AttributeAddEffect(AttributeCode.Shield, 20);

            let ship = new Ship();
            ship.shield.maximal = 80;
            ship.setAttribute(AttributeCode.Shield, 55);
            expect(ship.shield.current).toEqual(55);

            effect.applyOnShip(ship);
            expect(ship.shield.current).toEqual(75);

            effect.applyOnShip(ship);
            expect(ship.shield.current).toEqual(80);
        });
    });
}
