module TS.SpaceTac.Equipments {
    describe("Hulls", function () {
        it("generates IronHull based on level", function () {
            let template = new IronHull();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_materials": 1 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 200)]);
            expect(equipment.price).toEqual(100);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_materials": 2 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 220)]);
            expect(equipment.price).toEqual(300);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_materials": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 240)]);
            expect(equipment.price).toEqual(700);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_materials": 10 });
            expect(equipment.effects).toEqual([new AttributeEffect("hull_capacity", 380)]);
            expect(equipment.price).toEqual(9100);
        });

        it("generates HardCoatedHull based on level", function () {
            let template = new HardCoatedHull();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_materials": 2 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 300),
                new AttributeEffect("maneuvrability", -2),
            ]);
            expect(equipment.price).toEqual(120);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_materials": 4 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 315),
                new AttributeEffect("maneuvrability", -3),
            ]);
            expect(equipment.price).toEqual(330);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_materials": 6 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 330),
                new AttributeEffect("maneuvrability", -4),
            ]);
            expect(equipment.price).toEqual(750);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_materials": 20 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 435),
                new AttributeEffect("maneuvrability", -11),
            ]);
            expect(equipment.price).toEqual(9570);
        });

        it("generates FractalHull based on level", function () {
            let template = new FractalHull();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_quantum": 1 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 260),
                new AttributeEffect("maneuvrability", -1),
            ]);
            expect(equipment.price).toEqual(250);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_quantum": 2 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 270),
                new AttributeEffect("maneuvrability", -2),
            ]);
            expect(equipment.price).toEqual(480);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_quantum": 3 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 280),
                new AttributeEffect("maneuvrability", -2),
            ]);
            expect(equipment.price).toEqual(940);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_quantum": 10 });
            expect(equipment.effects).toEqual([
                new AttributeEffect("hull_capacity", 350),
                new AttributeEffect("maneuvrability", -6),
            ]);
            expect(equipment.price).toEqual(10600);
        });
    });
}
