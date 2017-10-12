module TK.SpaceTac.UI.Specs {
    describe("CharacterSlot", function () {
        let testgame = setupEmptyView();

        it("allows dragging equipment", function () {
            let view = testgame.view;
            let ship = new Ship();
            ship.addSlot(SlotType.Hull);
            let sheet = new CharacterSheet(view);
            sheet.show(ship);
            let source = new CharacterLootSlot(sheet, 0, 0);
            sheet.addChild(source);
            let equipment = new CharacterEquipment(sheet, new Equipment(SlotType.Engine), source);

            let slot = new CharacterSlot(sheet, 0, 0, SlotType.Engine);
            expect(slot.addEquipment(equipment, source, true)).toEqual({ success: false, info: 'equip in engine slot', error: 'no free slot' });
            expect(slot.removeEquipment(equipment, source, true)).toEqual({ success: false, info: 'unequip from engine slot', error: 'not equipped!' });

            ship.addSlot(SlotType.Engine);
            expect(slot.addEquipment(equipment, source, true)).toEqual({ success: true, info: 'equip in engine slot' });

            equipment.item.requirements["skill_time"] = 1;
            expect(slot.addEquipment(equipment, source, true)).toEqual({ success: false, info: 'equip in engine slot', error: 'missing skills' });

            ship.upgradeSkill("skill_time");
            expect(slot.addEquipment(equipment, source, true)).toEqual({ success: true, info: 'equip in engine slot' });

            ship.critical = true;
            expect(slot.addEquipment(equipment, source, true)).toEqual({ success: false, info: 'equip in engine slot', error: 'not a fleet member' });
            ship.critical = false;

            expect(ship.listEquipment(SlotType.Engine)).toEqual([]);
            let result = slot.addEquipment(equipment, source, false);
            expect(result).toEqual({ success: true, info: 'equip in engine slot' });
            expect(ship.listEquipment(SlotType.Engine)).toEqual([equipment.item]);

            expect(slot.removeEquipment(equipment, source, true)).toEqual({ success: true, info: 'unequip from engine slot' });
            ship.critical = true;
            expect(slot.removeEquipment(equipment, source, true)).toEqual({ success: false, info: 'unequip from engine slot', error: 'not a fleet member' });
            ship.critical = false;

            result = slot.removeEquipment(equipment, source, false);
            expect(result).toEqual({ success: true, info: 'unequip from engine slot' });
            expect(ship.listEquipment(SlotType.Engine)).toEqual([]);

        });
    });
}
