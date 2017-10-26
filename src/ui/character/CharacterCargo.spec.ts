module TK.SpaceTac.UI.Specs {
    testing("CharacterCargo", test => {
        let testgame = setupEmptyView();

        test.case("checks conditions for adding/removing equipment", check => {
            let view = testgame.view;
            let sheet = new CharacterSheet(view);
            let ship = new Ship();
            sheet.show(ship);

            let source = new CharacterCargo(sheet, 0, 0);
            let equipment = new CharacterEquipment(sheet, new Equipment(), source);

            let destination = new CharacterCargo(sheet, 0, 0);
            check.equals(destination.addEquipment(equipment, null, true), { success: false, info: 'put in cargo', error: 'not enough cargo space' });
            ship.setCargoSpace(1);
            check.equals(destination.addEquipment(equipment, null, true), { success: true, info: 'put in cargo' });
            ship.critical = true;
            check.equals(destination.addEquipment(equipment, null, true), { success: false, info: 'put in cargo', error: 'not a fleet member' });
            ship.critical = false;

            check.equals(source.removeEquipment(equipment, null, true), { success: false, info: 'remove from cargo', error: 'not in cargo!' });
            ship.addCargo(equipment.item);
            check.equals(source.removeEquipment(equipment, null, true), { success: true, info: 'remove from cargo' });
            ship.critical = true;
            check.equals(source.removeEquipment(equipment, null, true), { success: false, info: 'remove from cargo', error: 'not a fleet member' });
        });
    });
}
