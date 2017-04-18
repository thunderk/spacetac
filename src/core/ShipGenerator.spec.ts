module TS.SpaceTac.Specs {
    describe("ShipGenerator", function () {
        it("can use ship model", function () {
            var gen = new ShipGenerator();
            var model = new ShipModel("test", 1, 2, SlotType.Shield, SlotType.Weapon, SlotType.Weapon);
            var ship = gen.generate(1, model);
            expect(ship.model).toBe("test");
            expect(ship.cargo_space).toBe(2);
            expect(ship.slots.length).toBe(3);
            expect(ship.slots[0].type).toBe(SlotType.Shield);
            expect(ship.slots[1].type).toBe(SlotType.Weapon);
            expect(ship.slots[2].type).toBe(SlotType.Weapon);
            expect(ship.getAttribute("skill_material")).toBe(1);
        });
    });
}
