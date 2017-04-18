module TS.SpaceTac.Equipments {
    describe("NuclearReactor", function () {
        it("generates equipment based on level", function () {
            let template = new NuclearReactor();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_energy": 1 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("initiative", 1),
                new AttributeEffect("power_capacity", 6),
                new AttributeEffect("power_initial", 4),
                new AttributeEffect("power_recovery", 3),
            ]);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_energy": 2 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("initiative", 2),
                new AttributeEffect("power_capacity", 7),
                new AttributeEffect("power_initial", 4),
                new AttributeEffect("power_recovery", 3),
            ]);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_energy": 3 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("initiative", 3),
                new AttributeEffect("power_capacity", 8),
                new AttributeEffect("power_initial", 5),
                new AttributeEffect("power_recovery", 3),
            ]);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_energy": 10 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("initiative", 10),
                new AttributeEffect("power_capacity", 15),
                new AttributeEffect("power_initial", 8),
                new AttributeEffect("power_recovery", 5),
            ]);
        });
    });
}
