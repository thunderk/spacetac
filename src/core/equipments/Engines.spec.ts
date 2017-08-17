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
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 4)]);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 220, 120, 70));
            expect(equipment.price).toEqual(320);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_materials": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 6)]);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 240, 120, 70));
            expect(equipment.price).toEqual(720);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_materials": 10 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 20)]);
            expect(equipment.cooldown).toEqual(new Cooldown(2, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 380, 120, 70));
            expect(equipment.price).toEqual(9120);
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
            expect(equipment.action).toEqual(new MoveAction(equipment, 135, 120, 80));
            expect(equipment.price).toEqual(380);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_photons": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 3)]);
            expect(equipment.cooldown).toEqual(new Cooldown(3, 1));
            expect(equipment.action).toEqual(new MoveAction(equipment, 150, 120, 80));
            expect(equipment.price).toEqual(840);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_photons": 10 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 10)]);
            expect(equipment.cooldown).toEqual(new Cooldown(3, 1));
            expect(equipment.action).toEqual(new MoveAction(equipment, 255, 120, 80));
            expect(equipment.price).toEqual(10500);
        });

        it("generates VoidhawkEngine based on level", function () {
            let template = new VoidhawkEngine();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_gravity": 2 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", -5)]);
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 2000, 250, 0));
            expect(equipment.price).toEqual(340);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_gravity": 4 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", -5)]);
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 2000, 240, 0));
            expect(equipment.price).toEqual(500);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_gravity": 6 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", -4)]);
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 2000, 230, 0));
            expect(equipment.price).toEqual(820);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_gravity": 20 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 2)]);
            expect(equipment.cooldown).toEqual(new Cooldown(1, 0));
            expect(equipment.action).toEqual(new MoveAction(equipment, 2000, 160, 0));
            expect(equipment.price).toEqual(7540);
        });
    });
}
