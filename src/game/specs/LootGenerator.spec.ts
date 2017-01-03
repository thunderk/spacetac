module SpaceTac.Game.Specs {
    "use strict";

    class TestTemplate extends LootTemplate {
        constructor() {
            super(SlotType.Shield, "Hexagrid Shield");

            this.min_level = new IntegerRange(2, 100);
            this.ap_usage = new Range(6, 15);
        }
    }

    describe("LootGenerator", () => {
        it("generates items within a given level range", () => {
            var generator = new LootGenerator();
            generator.templates = [new TestTemplate()];
            generator.random.forceNextValue(0.5);

            var equipment = generator.generate(new IntegerRange(3, 6));

            expect(equipment.slot).toBe(SlotType.Shield);
            expect(equipment.name).toEqual("Hexagrid Shield");
            expect(equipment.min_level).toBe(5);
            expect(equipment.ap_usage).toBeCloseTo(6.2727, 0.00001);
        });
    });
}
