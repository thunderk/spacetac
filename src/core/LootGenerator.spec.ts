/// <reference path="LootTemplate.ts" />

module TK.SpaceTac.Specs {
    class TestTemplate extends LootTemplate {
        constructor() {
            super(SlotType.Shield, "Hexagrid Shield");

            this.setSkillsRequirements({ "skill_time": istep(2) });
        }
    }

    testing("LootGenerator", test => {
        test.case("generates items within a given level range", check => {
            var generator = new LootGenerator();
            generator.templates = [new TestTemplate()];
            generator.random = new SkewedRandomGenerator([0.5]);

            var equipment = generator.generate(2);
            if (equipment) {
                check.same(equipment.slot_type, SlotType.Shield);
                check.equals(equipment.name, "Hexagrid Shield");
                check.equals(equipment.requirements, { "skill_time": 3 });
            } else {
                check.fail("No equipment generated");
            }
        });
    });
}
