module TS.SpaceTac {
    describe("AttributeEffect", function () {
        it("is not applied directly", function () {
            let ship = new Ship();
            expect(ship.getAttribute("maneuvrability")).toBe(0);

            let effect = new AttributeEffect("maneuvrability", 20);
            effect.applyOnShip(ship, ship);
            expect(ship.getAttribute("maneuvrability")).toBe(0);

            ship.sticky_effects.push(new StickyEffect(effect, 2));
            ship.updateAttributes();
            expect(ship.getAttribute("maneuvrability")).toBe(20);
        });

        it("has a description", function () {
            let effect = new AttributeEffect("maneuvrability", 12);
            expect(effect.getDescription()).toEqual("maneuvrability +12");

            effect = new AttributeEffect("shield_capacity", -4);
            expect(effect.getDescription()).toEqual("shield capacity -4");
        });
    });
}
