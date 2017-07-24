module TS.SpaceTac.UI.Specs {
    describe("CharacterSlot", function () {
        let testgame = setupEmptyView();

        it("allows dragging equipment", function () {
            let view = testgame.baseview;
            let ship = new Ship();
            ship.addSlot(SlotType.Hull);
            let sheet = new CharacterSheet(view);
            sheet.show(ship);
            let source = new CharacterLootSlot(sheet, 0, 0);
            sheet.addChild(source);
            let equipment = new CharacterEquipment(sheet, new Equipment(SlotType.Engine), source);

            let slot = new CharacterSlot(sheet, 0, 0, SlotType.Engine);
            expect(slot.addEquipment(equipment, source, true)).toBe(false);
            expect(slot.removeEquipment(equipment, source, true)).toBe(false);

            ship.addSlot(SlotType.Engine);
            expect(slot.addEquipment(equipment, source, true)).toBe(true);

            equipment.item.requirements["skill_time"] = 1;
            expect(slot.addEquipment(equipment, source, true)).toBe(false);

            ship.upgradeSkill("skill_time");
            expect(slot.addEquipment(equipment, source, true)).toBe(true);

            ship.critical = true;
            expect(slot.addEquipment(equipment, source, true)).toBe(false);
            ship.critical = false;

            expect(ship.listEquipment(SlotType.Engine)).toEqual([]);
            let result = slot.addEquipment(equipment, source, false);
            expect(result).toBe(true);
            expect(ship.listEquipment(SlotType.Engine)).toEqual([equipment.item]);

            expect(slot.removeEquipment(equipment, source, true)).toBe(true);
            ship.critical = true;
            expect(slot.removeEquipment(equipment, source, true)).toBe(false);
            ship.critical = false;

            result = slot.removeEquipment(equipment, source, false);
            expect(result).toBe(true);
            expect(ship.listEquipment(SlotType.Engine)).toEqual([]);

        });
    });
}
