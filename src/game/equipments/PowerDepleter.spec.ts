module TS.SpaceTac.Game.Specs {
    describe("PowerDepleter", () => {
        it("limits target's AP", () => {
            var template = new Equipments.PowerDepleter();
            var equipment = template.generateFixed(0);

            var ship = new Ship();
            var target = new Ship();
            TestTools.setShipAP(target, 7, 2);
            spyOn(equipment.action, "canBeUsed").and.returnValue(true);

            expect(target.values.power.get()).toBe(7);
            expect(target.sticky_effects).toEqual([]);

            // Attribute is immediately limited
            equipment.action.apply(null, ship, Target.newFromShip(target));

            expect(target.values.power.get()).toBe(4);
            expect(target.sticky_effects).toEqual([
                new StickyEffect(new AttributeLimitEffect("power_capacity", 4), 1, true, false)
            ]);

            // Attribute is limited for one turn, and prevents AP recovery
            target.values.power.set(6);
            target.recoverActionPoints();
            target.startTurn();

            expect(target.values.power.get()).toBe(4);
            expect(target.sticky_effects).toEqual([]);

            // Effect vanished, so AP recovery happens
            target.endTurn();

            expect(target.values.power.get()).toBe(6);
            expect(target.sticky_effects).toEqual([]);
        });
    });
}
