module TS.SpaceTac.Specs {
    describe("ShipGenerator", function () {
        it("can use ship model", function () {
            var gen = new ShipGenerator();
            var model = new ShipModel("test", "Test", 1, 2, true, 3);
            var ship = gen.generate(1, model);
            expect(ship.model).toBe(model);
            expect(ship.cargo_space).toBe(2);
            expect(ship.slots.length).toBe(7);
            expect(ship.slots[0].type).toBe(SlotType.Hull);
            expect(ship.slots[1].type).toBe(SlotType.Shield);
            expect(ship.slots[2].type).toBe(SlotType.Power);
            expect(ship.slots[3].type).toBe(SlotType.Engine);
            expect(ship.slots[4].type).toBe(SlotType.Weapon);
            expect(ship.slots[5].type).toBe(SlotType.Weapon);
            expect(ship.slots[6].type).toBe(SlotType.Weapon);
            expect(ship.getAttribute("skill_material")).toBe(1);
        });
    });
}
