module TK.SpaceTac {
    describe("AttributeLimitEffect", function () {
        it("limits an attribute", function () {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            expect(ship.getAttribute("shield_capacity")).toBe(0);
            expect(ship.getValue("shield")).toBe(0);

            TestTools.setShipHP(ship, 100, 50);
            ship.setValue("shield", 40);
            expect(ship.getAttribute("shield_capacity")).toBe(50);
            expect(ship.getValue("shield")).toBe(40);

            battle.log.clear();
            let effect = new StickyEffect(new AttributeLimitEffect("shield_capacity", 30));
            ship.addStickyEffect(effect);

            expect(ship.getAttribute("shield_capacity")).toBe(30);
            expect(ship.getValue("shield")).toBe(30);
            expect(battle.log.events).toEqual([
                new ActiveEffectsEvent(ship, [new AttributeEffect("hull_capacity", 100), new AttributeEffect("shield_capacity", 50)], [effect]),
                new ValueChangeEvent(ship, new ShipValue("shield", 30, 50), -10),
                new ValueChangeEvent(ship, new ShipAttribute("shield capacity", 30), -20),
            ]);

            ship.cleanStickyEffects();

            expect(ship.getAttribute("shield_capacity")).toBe(50);
            expect(ship.getValue("shield")).toBe(30);
        });
    });
}
