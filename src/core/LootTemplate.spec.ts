module TS.SpaceTac.Specs {
    describe("LootTemplate", () => {
        it("interpolates between weak and strong loot", () => {
            var template = new LootTemplate(SlotType.Weapon, "Bulletator");

            template.distance = new Range(1, 3);
            template.blast = new Range(1, 1);
            template.duration = new IntegerRange(1, 2);
            template.ap_usage = new Range(4, 12);
            template.min_level = new IntegerRange(5, 9);
            template.addRequirement("skill_energy", 2, 8);
            template.addRequirement("skill_human", 5);

            var equipment = template.generateFixed(0.0);

            expect(equipment.slot).toEqual(SlotType.Weapon);
            expect(equipment.code).toEqual("bulletator");
            expect(equipment.name).toEqual("Bulletator");
            expect(equipment.distance).toEqual(1);
            expect(equipment.blast).toEqual(1);
            expect(equipment.duration).toEqual(1);
            expect(equipment.ap_usage).toEqual(4);
            expect(equipment.min_level).toEqual(5);
            expect(equipment.requirements).toEqual({
                "skill_energy": 2,
                "skill_human": 5
            });

            equipment = template.generateFixed(1.0);

            expect(equipment.slot).toEqual(SlotType.Weapon);
            expect(equipment.code).toEqual("bulletator");
            expect(equipment.name).toEqual("Bulletator");
            expect(equipment.distance).toEqual(3);
            expect(equipment.blast).toEqual(1);
            expect(equipment.duration).toEqual(2);
            expect(equipment.ap_usage).toEqual(12);
            expect(equipment.min_level).toEqual(9);
            expect(equipment.requirements).toEqual({
                "skill_energy": 8,
                "skill_human": 5
            });

            equipment = template.generateFixed(0.5);

            expect(equipment.slot).toEqual(SlotType.Weapon);
            expect(equipment.code).toEqual("bulletator");
            expect(equipment.name).toEqual("Bulletator");
            expect(equipment.distance).toEqual(2);
            expect(equipment.blast).toEqual(1);
            expect(equipment.duration).toEqual(2);
            expect(equipment.ap_usage).toEqual(8);
            expect(equipment.min_level).toEqual(7);
            expect(equipment.requirements).toEqual({
                "skill_energy": 5,
                "skill_human": 5
            });
        });

        it("restricts power range to stay in a level range", () => {
            var template = new LootTemplate(SlotType.Weapon, "Bulletator");
            template.min_level = new IntegerRange(4, 7);

            var result: any;

            result = template.getPowerRangeForLevel(new IntegerRange(4, 7));
            expect(result.min).toBe(0);
            expect(result.max).toBe(1);

            result = template.getPowerRangeForLevel(new IntegerRange(1, 10));
            expect(result.min).toBe(0);
            expect(result.max).toBe(1);

            result = template.getPowerRangeForLevel(new IntegerRange(5, 6));
            expect(result.min).toBeCloseTo(0.25, 0.000001);
            expect(result.max).toBeCloseTo(0.75, 0.000001);

            result = template.getPowerRangeForLevel(new IntegerRange(5, 12));
            expect(result.min).toBeCloseTo(0.25, 0.000001);
            expect(result.max).toBe(1);

            result = template.getPowerRangeForLevel(new IntegerRange(3, 6));
            expect(result.min).toBe(0);
            expect(result.max).toBeCloseTo(0.75, 0.000001);

            result = template.getPowerRangeForLevel(new IntegerRange(10, 15));
            expect(result).toBeNull();

            result = template.getPowerRangeForLevel(new IntegerRange(1, 3));
            expect(result).toBeNull();

            result = template.getPowerRangeForLevel(new IntegerRange(5, 5));
            expect(result.min).toBeCloseTo(0.25, 0.000001);
            expect(result.max).toBeCloseTo(0.5, 0.000001);
        });

        it("adds modulated effects", () => {
            let template = new LootTemplate(SlotType.Weapon, "Bulletator");
            template.addEffect(new DamageEffect(), 5, 10, true);

            expect(template.generateFixed(0).target_effects).toEqual([new DamageEffect(5)]);
            expect(template.generateFixed(1).target_effects).toEqual([new DamageEffect(10)]);

            template.addEffect(new AttributeEffect("initiative"), 1, 2, false);

            expect(template.generateFixed(0).permanent_effects).toEqual([new AttributeEffect("initiative", 1)]);
            expect(template.generateFixed(1).permanent_effects).toEqual([new AttributeEffect("initiative", 2)]);
        });

        it("adds modulated sticky effects", () => {
            let template = new LootTemplate(SlotType.Weapon, "Bulletator");
            template.addStickyEffect(new DamageEffect(), 5, 10, 1, 2, true, false, true);

            expect(template.generateFixed(0).target_effects).toEqual([new StickyEffect(new DamageEffect(5), 1, true, false)]);
            expect(template.generateFixed(1).target_effects).toEqual([new StickyEffect(new DamageEffect(10), 2, true, false)]);

            template.addStickyEffect(new AttributeLimitEffect("power_recovery"), 1, 2, 1, null, false, true, false);

            expect(template.generateFixed(0).permanent_effects).toEqual([new StickyEffect(new AttributeLimitEffect("power_recovery", 1), 1, false, true)]);
            expect(template.generateFixed(1).permanent_effects).toEqual([new StickyEffect(new AttributeLimitEffect("power_recovery", 2), 1, false, true)]);
        });
    });
}
