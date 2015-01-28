/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game.Specs {
    "use strict";

    describe("LootTemplate", () => {
        it("interpolates between weak and strong loot", () => {
            var template = new LootTemplate(SlotType.Weapon, "Bulletator");

            template.distance = new Range(1, 3);
            template.blast = new Range(1, 1);
            template.duration = new IntegerRange(1, 2);
            template.ap_usage = new Range(4, 12);
            template.min_level = new IntegerRange(5, 9);

            var equipment = template.generateFixed(0.0);

            expect(equipment.slot).toEqual(SlotType.Weapon);
            expect(equipment.name).toEqual("Bulletator");
            expect(equipment.distance).toEqual(1);
            expect(equipment.blast).toEqual(1);
            expect(equipment.duration).toEqual(1);
            expect(equipment.ap_usage).toEqual(4);
            expect(equipment.min_level).toEqual(5);

            equipment = template.generateFixed(1.0);

            expect(equipment.slot).toEqual(SlotType.Weapon);
            expect(equipment.name).toEqual("Bulletator");
            expect(equipment.distance).toEqual(3);
            expect(equipment.blast).toEqual(1);
            expect(equipment.duration).toEqual(2);
            expect(equipment.ap_usage).toEqual(12);
            expect(equipment.min_level).toEqual(9);

            equipment = template.generateFixed(0.5);

            expect(equipment.slot).toEqual(SlotType.Weapon);
            expect(equipment.name).toEqual("Bulletator");
            expect(equipment.distance).toEqual(2);
            expect(equipment.blast).toEqual(1);
            expect(equipment.duration).toEqual(2);
            expect(equipment.ap_usage).toEqual(8);
            expect(equipment.min_level).toEqual(7);
        });

        it("restricts power range to stay in a level range", () => {
            var template = new LootTemplate(SlotType.Weapon, "Bulletator");
            template.min_level = new IntegerRange(4, 7);

            var result: Range;

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

        it("adds damage on target effects", () => {
            var template = new LootTemplate(SlotType.Weapon, "Bulletator");
            template.addDamageOnTargetEffect(80, 120);

            var result = template.generateFixed(0.5);
            expect(result.target_effects.length).toBe(1);
            var effect = <DamageEffect>result.target_effects[0];
            expect(effect.code).toEqual("damage");
            expect(effect.value).toEqual(100);
        });
    });
}
