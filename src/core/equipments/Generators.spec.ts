module TK.SpaceTac.Equipments {
    describe("Generators", function () {
        it("generates NuclearReactor based on level", function () {
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
        })

        it("generates KelvinGenerator based on level", function () {
            let template = new KelvinGenerator();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_time": 1 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("power_capacity", 5),
                new AttributeEffect("power_generation", 4),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 1, 0, 0, [
                new CooldownEffect(1, 1)
            ]));
            expect(equipment.price).toEqual(420);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_time": 2 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("power_capacity", 6),
                new AttributeEffect("power_generation", 4),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 1, 0, 0, [
                new CooldownEffect(1, 1)
            ]));
            expect(equipment.price).toEqual(1470);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_time": 4, "skill_gravity": 1 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("power_capacity", 6),
                new AttributeEffect("power_generation", 5),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 1, 0, 0, [
                new CooldownEffect(1, 1)
            ]));
            expect(equipment.price).toEqual(3570);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_time": 28, "skill_gravity": 6 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("power_capacity", 13),
                new AttributeEffect("power_generation", 12),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 7, 0, 0, [
                new CooldownEffect(4, 7)
            ]));
            expect(equipment.price).toEqual(47670);
        })
    })
}
