module TS.SpaceTac.Specs {
    describe("PowerDepleter", () => {
        it("limits target's AP", () => {
            var template = new Equipments.PowerDepleter();
            var equipment = template.generateFixed(0);

            var ship = new Ship();
            var target = new Ship();
            TestTools.setShipAP(ship, 50);
            TestTools.setShipAP(target, 7, 2);

            expect(target.values.power.get()).toBe(7);
            expect(target.sticky_effects).toEqual([]);

            // Attribute is immediately limited
            equipment.action.apply(ship, Target.newFromShip(target));

            expect(target.values.power.get()).toBe(4);
            expect(target.sticky_effects).toEqual([
                new StickyEffect(new AttributeLimitEffect("power_capacity", 4), 2, true, false)
            ]);

            // Attribute is limited for two turns, and prevents AP recovery
            target.values.power.set(6);
            target.recoverActionPoints();
            target.startTurn();

            expect(target.values.power.get()).toBe(4);
            expect(target.sticky_effects).toEqual([
                new StickyEffect(new AttributeLimitEffect("power_capacity", 4), 1, true, false)
            ]);

            target.endTurn();
            target.recoverActionPoints();
            expect(target.values.power.get()).toBe(4);
            target.startTurn();

            expect(target.sticky_effects).toEqual([]);

            // Effect vanished, so AP recovery happens
            target.endTurn();

            expect(target.values.power.get()).toBe(6);
            expect(target.sticky_effects).toEqual([]);
        });
    });
}
