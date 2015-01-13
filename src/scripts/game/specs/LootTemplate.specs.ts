/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game.Specs {
    "use strict";

    describe("LootTemplate", () => {
        it("interpolates between weak and strong loot", () => {
            var template = new LootTemplate(SlotType.Weapon, "Bulletator");

            template.distance = new Range(1, 3);
            template.blast = new Range(1, 1);
            template.duration = new Range(1, 2);
            template.ap_usage = new Range(4, 12);
            template.min_level = new Range(5, 9);

            var equipment = template.generateFixed(0.0);

            expect(equipment.slot).toEqual(SlotType.Weapon);
            expect(equipment.name).toEqual("Bulletator");
            expect(equipment.distance).toEqual(1);
            expect(equipment.blast).toEqual(1);
            expect(equipment.duration).toEqual(1);
            expect(equipment.ap_usage).toEqual(4);
            expect(equipment.min_level).toEqual(5);

            var equipment = template.generateFixed(1.0);

            expect(equipment.slot).toEqual(SlotType.Weapon);
            expect(equipment.name).toEqual("Bulletator");
            expect(equipment.distance).toEqual(3);
            expect(equipment.blast).toEqual(1);
            expect(equipment.duration).toEqual(2);
            expect(equipment.ap_usage).toEqual(12);
            expect(equipment.min_level).toEqual(9);

            var equipment = template.generateFixed(0.5);

            expect(equipment.slot).toEqual(SlotType.Weapon);
            expect(equipment.name).toEqual("Bulletator");
            expect(equipment.distance).toEqual(2);
            expect(equipment.blast).toEqual(1);
            expect(equipment.duration).toEqual(1);
            expect(equipment.ap_usage).toEqual(8);
            expect(equipment.min_level).toEqual(7);
        });
    });
}