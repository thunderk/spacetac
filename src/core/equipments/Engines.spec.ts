module TS.SpaceTac.Equipments {
    describe("Engines", function () {
        it("generates RocketEngine based on level", function () {
            let template = new RocketEngine();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_materials": 1 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 2)]);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 200, 120, 70));
            expect(equipment.price).toEqual(120);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_materials": 2 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 2)]);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 210, 120, 70));
            expect(equipment.price).toEqual(420);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_materials": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 3)]);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 220, 120, 70));
            expect(equipment.price).toEqual(1020);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_materials": 17 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 14)]);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 290, 120, 70));
            expect(equipment.price).toEqual(13620);
        });

        it("generates IonThruster based on level", function () {
            let template = new IonThruster();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_photons": 1 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 1)]);
            expect(equipment.cooldown).toEqual(new Cooldown(3, 1));
            expect(equipment.action).toEqual(new MoveAction(equipment, 120, 120, 80));
            expect(equipment.price).toEqual(150);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_photons": 2 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 2)]);
            expect(equipment.cooldown).toEqual(new Cooldown(3, 1));
            expect(equipment.action).toEqual(new MoveAction(equipment, 130, 120, 80));
            expect(equipment.price).toEqual(525);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_photons": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 3)]);
            expect(equipment.cooldown).toEqual(new Cooldown(3, 1));
            expect(equipment.action).toEqual(new MoveAction(equipment, 140, 120, 80));
            expect(equipment.price).toEqual(1275);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_photons": 17 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 17)]);
            expect(equipment.cooldown).toEqual(new Cooldown(3, 1));
            expect(equipment.action).toEqual(new MoveAction(equipment, 210, 120, 80));
            expect(equipment.price).toEqual(17025);
        });

        it("generates VoidhawkEngine based on level", function () {
            let template = new VoidhawkEngine();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_gravity": 2 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", -3)]);
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 2000, 270, 0));
            expect(equipment.price).toEqual(300);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_gravity": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", -4)]);
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 2000, 245, 0));
            expect(equipment.price).toEqual(1050);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_gravity": 5 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", -4)]);
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 2000, 224, 0));
            expect(equipment.price).toEqual(2550);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_gravity": 26 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", -5)]);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 2000, 155, 0));
            expect(equipment.price).toEqual(34050);
        });
    });
}
