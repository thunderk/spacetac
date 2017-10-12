module TK.SpaceTac.UI.Specs {
    describe("CharacterCargo", function () {
        let testgame = setupEmptyView();

        it("checks conditions for adding/removing equipment", function () {
            let view = testgame.view;
            let sheet = new CharacterSheet(view);
            let ship = new Ship();
            sheet.show(ship);

            let source = new CharacterCargo(sheet, 0, 0);
            let equipment = new CharacterEquipment(sheet, new Equipment(), source);

            let destination = new CharacterCargo(sheet, 0, 0);
            expect(destination.addEquipment(equipment, null, true)).toEqual({ success: false, info: 'put in cargo', error: 'not enough cargo space' });
            ship.setCargoSpace(1);
            expect(destination.addEquipment(equipment, null, true)).toEqual({ success: true, info: 'put in cargo' });
            ship.critical = true;
            expect(destination.addEquipment(equipment, null, true)).toEqual({ success: false, info: 'put in cargo', error: 'not a fleet member' });
            ship.critical = false;

            expect(source.removeEquipment(equipment, null, true)).toEqual({ success: false, info: 'remove from cargo', error: 'not in cargo!' });
            ship.addCargo(equipment.item);
            expect(source.removeEquipment(equipment, null, true)).toEqual({ success: true, info: 'remove from cargo' });
            ship.critical = true;
            expect(source.removeEquipment(equipment, null, true)).toEqual({ success: false, info: 'remove from cargo', error: 'not a fleet member' });
        });
    });
}
