module TS.SpaceTac.Equipments {
    describe("NuclearReactor", function () {
        it("generates equipment based on level", function () {
            let template = new NuclearReactor();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_photons": 1 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("maneuvrability", 1),
                new AttributeEffect("power_capacity", 7),
                new AttributeEffect("power_generation", 4),
            ]);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_photons": 2 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("maneuvrability", 2),
                new AttributeEffect("power_capacity", 8),
                new AttributeEffect("power_generation", 4),
            ]);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_photons": 3 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("maneuvrability", 3),
                new AttributeEffect("power_capacity", 9),
                new AttributeEffect("power_generation", 4),
            ]);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_photons": 10 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("maneuvrability", 10),
                new AttributeEffect("power_capacity", 16),
                new AttributeEffect("power_generation", 6),
            ]);
        });
    });
}
