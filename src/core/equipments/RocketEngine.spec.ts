module TS.SpaceTac.Equipments {
    describe("Rocket Engine", function () {
        it("generates equipment based on level", function () {
            let template = new RocketEngine();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_photons": 1 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 1)]);
            expect(equipment.action).toEqual(new MoveAction(equipment, 200));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_photons": 2 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 2)]);
            expect(equipment.action).toEqual(new MoveAction(equipment, 220));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_photons": 3 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 3)]);
            expect(equipment.action).toEqual(new MoveAction(equipment, 240));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_photons": 10 });
            expect(equipment.effects).toEqual([new AttributeEffect("maneuvrability", 10)]);
            expect(equipment.action).toEqual(new MoveAction(equipment, 380));
        });
    });
}
