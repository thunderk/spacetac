module TS.SpaceTac {
    describe("AttributeEffect", function () {
        it("is not applied directly", function () {
            let ship = new Ship();
            expect(ship.getAttribute("initiative")).toBe(0);

            let effect = new AttributeEffect("initiative", 20);
            effect.applyOnShip(ship);
            expect(ship.getAttribute("initiative")).toBe(0);

            ship.sticky_effects.push(new StickyEffect(effect, 2));
            ship.updateAttributes();
            expect(ship.getAttribute("initiative")).toBe(20);
        });

        it("has a description", function () {
            let effect = new AttributeEffect("initiative", 12);
            expect(effect.getDescription()).toEqual("initiative +12");

            effect = new AttributeEffect("shield_capacity", -4);
            expect(effect.getDescription()).toEqual("shield capacity -4");
        });
    });
}
