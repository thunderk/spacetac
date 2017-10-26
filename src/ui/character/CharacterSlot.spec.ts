module TK.SpaceTac.UI.Specs {
    testing("CharacterSlot", test => {
        let testgame = setupEmptyView();

        test.case("allows dragging equipment", check => {
            let view = testgame.view;
            let ship = new Ship();
            ship.addSlot(SlotType.Hull);
            let sheet = new CharacterSheet(view);
            sheet.show(ship);
            let source = new CharacterLootSlot(sheet, 0, 0);
            sheet.addChild(source);
            let equipment = new CharacterEquipment(sheet, new Equipment(SlotType.Engine), source);

            let slot = new CharacterSlot(sheet, 0, 0, SlotType.Engine);
            check.equals(slot.addEquipment(equipment, source, true), { success: false, info: 'equip in engine slot', error: 'no free slot' });
            check.equals(slot.removeEquipment(equipment, source, true), { success: false, info: 'unequip from engine slot', error: 'not equipped!' });

            ship.addSlot(SlotType.Engine);
            check.equals(slot.addEquipment(equipment, source, true), { success: true, info: 'equip in engine slot' });

            equipment.item.requirements["skill_time"] = 1;
            check.equals(slot.addEquipment(equipment, source, true), { success: false, info: 'equip in engine slot', error: 'missing skills' });

            ship.upgradeSkill("skill_time");
            check.equals(slot.addEquipment(equipment, source, true), { success: true, info: 'equip in engine slot' });

            ship.critical = true;
            check.equals(slot.addEquipment(equipment, source, true), { success: false, info: 'equip in engine slot', error: 'not a fleet member' });
            ship.critical = false;

            check.equals(ship.listEquipment(SlotType.Engine), []);
            let result = slot.addEquipment(equipment, source, false);
            check.equals(result, { success: true, info: 'equip in engine slot' });
            check.equals(ship.listEquipment(SlotType.Engine), [equipment.item]);

            check.equals(slot.removeEquipment(equipment, source, true), { success: true, info: 'unequip from engine slot' });
            ship.critical = true;
            check.equals(slot.removeEquipment(equipment, source, true), { success: false, info: 'unequip from engine slot', error: 'not a fleet member' });
            ship.critical = false;

            result = slot.removeEquipment(equipment, source, false);
            check.equals(result, { success: true, info: 'unequip from engine slot' });
            check.equals(ship.listEquipment(SlotType.Engine), []);

        });
    });
}
