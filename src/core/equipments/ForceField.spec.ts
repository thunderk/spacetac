module TS.SpaceTac.Equipments {
    describe("ForceField", function () {
        it("generates equipment based on level", function () {
            let template = new ForceField();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_photons": 1 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 100)]);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_photons": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 140)]);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_photons": 5 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 180)]);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_photons": 19 });
            expect(equipment.effects).toEqual([new AttributeEffect("shield_capacity", 460)]);
        });
    });
}
