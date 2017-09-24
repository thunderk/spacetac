module TK.SpaceTac.Equipments {
    describe("Hulls", function () {
        it("generates IronHull based on level", function () {
            let template = new IronHull();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_materials": 1 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 100)]);
            expect(equipment.price).toEqual(100);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_materials": 2 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 140)]);
            expect(equipment.price).toEqual(350);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_materials": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 188)]);
            expect(equipment.price).toEqual(850);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_materials": 17 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 748)]);
            expect(equipment.price).toEqual(11350);
        });

        it("generates HardCoatedHull based on level", function () {
            let template = new HardCoatedHull();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_materials": 2 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 130),
                new AttributeEffect("maneuvrability", -2),
            ]);
            expect(equipment.price).toEqual(124);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_materials": 5 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 182),
                new AttributeEffect("maneuvrability", -3),
            ]);
            expect(equipment.price).toEqual(434);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_materials": 8 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 244),
                new AttributeEffect("maneuvrability", -5),
            ]);
            expect(equipment.price).toEqual(1054);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_materials": 50 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 972),
                new AttributeEffect("maneuvrability", -19),
            ]);
            expect(equipment.price).toEqual(14074);
        });

        it("generates FractalHull based on level", function () {
            let template = new FractalHull();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_quantum": 1 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 60),
                new AttributeEffect("precision", 2),
            ]);
            expect(equipment.action).toEqual(new FireWeaponAction(equipment, 1, 0, 0, [
                new ValueEffect("hull", 60)
            ]))
            expect(equipment.cooldown).toEqual(new Cooldown(1, 4));
            expect(equipment.price).toEqual(250);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_quantum": 3 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 84),
                new AttributeEffect("precision", 2),
            ]);
            expect(equipment.cooldown).toEqual(new Cooldown(1, 4));
            expect(equipment.price).toEqual(875);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_quantum": 5 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 112),
                new AttributeEffect("precision", 3),
            ]);
            expect(equipment.cooldown).toEqual(new Cooldown(1, 4));
            expect(equipment.price).toEqual(2125);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_quantum": 33 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 448),
                new AttributeEffect("precision", 14),
            ]);
            expect(equipment.cooldown).toEqual(new Cooldown(1, 4));
            expect(equipment.price).toEqual(28375);
        });
    });
}
