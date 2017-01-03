/// <reference path="../EnergyDepleter.ts"/>

module SpaceTac.Game.Specs {
    describe("EnergyDepleter", () => {
        it("limits target's AP", () => {
            var template = new Equipments.EnergyDepleter();
            var equipment = template.generateFixed(0);

            var ship = new Ship();
            var target = new Ship();
            TestTools.setShipAP(target, 7, 2);
            spyOn(equipment.action, "canBeUsed").and.returnValue(true);

            expect(target.ap_current.current).toBe(7);
            expect(target.temporary_effects).toEqual([]);

            // Attribute is immediately limited
            equipment.action.apply(null, ship, Target.newFromShip(target));

            expect(target.ap_current.current).toBe(4);
            expect(target.temporary_effects).toEqual([
                new AttributeLimitEffect(AttributeCode.AP, 1, 4)
            ]);

            // Attribute is limited for one turn, and prevents AP recovery
            target.ap_current.set(6);
            target.startTurn();

            expect(target.ap_current.current).toBe(4);
            expect(target.temporary_effects).toEqual([
                new AttributeLimitEffect(AttributeCode.AP, 1, 4)
            ]);

            target.endTurn();
            expect(target.ap_current.current).toBe(4);
            expect(target.temporary_effects).toEqual([]);

            // Attribute vanishes before the start of next turn, so AP recovery happens
            target.startTurn();

            expect(target.ap_current.current).toBe(6);
            expect(target.temporary_effects).toEqual([]);

            target.endTurn();
        });
    });
}
