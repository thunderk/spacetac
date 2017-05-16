module TS.SpaceTac.Equipments {
    describe("IronHull", function () {
        it("generates equipment based on level", function () {
            let template = new IronHull();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_material": 1 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 200)]);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_material": 2 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 220)]);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_material": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 240)]);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_material": 10 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 380)]);
        });
    });
}
