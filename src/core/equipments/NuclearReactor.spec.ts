module TK.SpaceTac.Equipments {
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
            expect(equipment.price).toEqual(395);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_photons": 3 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("maneuvrability", 2),
                new AttributeEffect("power_capacity", 7),
                new AttributeEffect("power_generation", 5),
            ]);
            expect(equipment.price).toEqual(1382);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_photons": 5 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("maneuvrability", 3),
                new AttributeEffect("power_capacity", 8),
                new AttributeEffect("power_generation", 5),
            ]);
            expect(equipment.price).toEqual(3357);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_photons": 33 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("maneuvrability", 10),
                new AttributeEffect("power_capacity", 15),
                new AttributeEffect("power_generation", 12),
            ]);
            expect(equipment.price).toEqual(44832);
        });
    });
}
