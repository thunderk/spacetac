module TS.SpaceTac.UI.Specs {
    describe("CharacterCargo", function () {
        let testgame = setupEmptyView();

        it("checks conditions for adding/removing equipment", function () {
            let view = testgame.baseview;
            let sheet = new CharacterSheet(view);
            let ship = new Ship();
            sheet.show(ship);

            let source = new CharacterCargo(sheet, 0, 0);
            let equipment = new CharacterEquipment(sheet, new Equipment(), source);

            let destination = new CharacterCargo(sheet, 0, 0);
            expect(destination.addEquipment(equipment, null, true)).toBe(false);
            ship.setCargoSpace(1);
            expect(destination.addEquipment(equipment, null, true)).toBe(true);
            ship.critical = true;
            expect(destination.addEquipment(equipment, null, true)).toBe(false);
            ship.critical = false;

            expect(source.removeEquipment(equipment, null, true)).toBe(false);
            ship.addCargo(equipment.item);
            expect(source.removeEquipment(equipment, null, true)).toBe(true);
            ship.critical = true;
            expect(source.removeEquipment(equipment, null, true)).toBe(false);
        });
    });
}
