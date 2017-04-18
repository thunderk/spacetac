module TS.SpaceTac.Equipments {
    describe("ConventionalEngine", function () {
        it("generates equipment based on level", function () {
            let template = new ConventionalEngine();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_energy": 1 });
            expect(equipment.effects).toEqual([new AttributeEffect("initiative", 1)]);
            expect(equipment.action).toEqual(new MoveAction(equipment, 200));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_energy": 2 });
            expect(equipment.effects).toEqual([new AttributeEffect("initiative", 2)]);
            expect(equipment.action).toEqual(new MoveAction(equipment, 220));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_energy": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("initiative", 3)]);
            expect(equipment.action).toEqual(new MoveAction(equipment, 240));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_energy": 10 });
            expect(equipment.effects).toEqual([new AttributeEffect("initiative", 10)]);
            expect(equipment.action).toEqual(new MoveAction(equipment, 380));
        });
    });
}
