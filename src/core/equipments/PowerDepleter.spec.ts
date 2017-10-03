module TK.SpaceTac.Equipments {
    describe("PowerDepleter", () => {
        it("generates equipment based on level", function () {
            let template = new PowerDepleter();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 1 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ], 4, 460, 0));
            expect(equipment.price).toEqual(100);

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 2 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ], 4, 490, 0));
            expect(equipment.price).toEqual(350);

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 4 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ], 4, 526, 0));
            expect(equipment.price).toEqual(850);

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_antimatter": 25 });
            expect(equipment.action).toEqual(new TriggerAction(equipment, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ], 4, 946, 0));
            expect(equipment.price).toEqual(11350);
        });
    });
}
