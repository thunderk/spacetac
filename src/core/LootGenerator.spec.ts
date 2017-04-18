/// <reference path="LootTemplate.ts" />

module TS.SpaceTac.Specs {
    class TestTemplate extends LootTemplate {
        constructor() {
            super(SlotType.Shield, "Hexagrid Shield");

            this.setSkillsRequirements({ "skill_time": istep(2) });
        }
    }

    describe("LootGenerator", () => {
        it("generates items within a given level range", () => {
            var generator = new LootGenerator();
            generator.templates = [new TestTemplate()];
            generator.random = new SkewedRandomGenerator([0.5]);

            var equipment = generator.generate(2);
            if (equipment) {
                expect(equipment.slot_type).toBe(SlotType.Shield);
                expect(equipment.name).toEqual("Hexagrid Shield");
                expect(equipment.requirements).toEqual({ "skill_time": 3 });
            } else {
                fail("No equipment generated");
            }
        });
    });
}
