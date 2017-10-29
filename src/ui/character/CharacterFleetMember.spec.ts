module TK.SpaceTac.UI.Specs {
    testing("CharacterFleetMember", test => {
        let testgame = setupEmptyView(test);

        test.case("transfers equipment to another ship", check => {
            let view = testgame.view;
            let sheet = new CharacterSheet(view);

            let fleet = new Fleet();
            let ship1 = fleet.addShip();
            ship1.setCargoSpace(3);
            let equ1 = new Equipment(SlotType.Engine, "engine1");
            ship1.addCargo(equ1);
            let equ2 = new Equipment(SlotType.Engine, "engine2");
            ship1.addCargo(equ2);
            let equ3 = new Equipment(SlotType.Engine, "engine3");
            ship1.addCargo(equ3);
            let ship2 = fleet.addShip();
            let ship2engine = ship2.addSlot(SlotType.Engine);
            ship2.setCargoSpace(1);

            sheet.show(ship1);
            check.equals(sheet.portraits.length, 2);
            check.equals(sheet.layer_equipments.length, 3);
            check.equals(sheet.ship_cargo.length, 3);

            // First item fits in the free slot
            let source = <CharacterCargo>sheet.ship_cargo.children[0];
            let dest = <CharacterFleetMember>sheet.portraits.children[1];
            let equ = <CharacterEquipment>sheet.layer_equipments.children[0];
            check.same(dest.ship, ship2);
            check.same(equ.item, equ1);
            check.contains(ship1.cargo, equ1);
            check.equals(ship2engine.attached, null);
            equ.applyDragDrop(source, dest, false);
            check.notcontains(ship1.cargo, equ1);
            check.same(ship2engine.attached, equ1);

            // Second item goes to cargo
            source = <CharacterCargo>sheet.ship_cargo.children[0];
            dest = <CharacterFleetMember>sheet.portraits.children[1];
            equ = <CharacterEquipment>sheet.layer_equipments.children[1];
            check.same(dest.ship, ship2);
            check.same(equ.item, equ2);
            check.contains(ship1.cargo, equ2);
            check.notcontains(ship2.cargo, equ2);
            equ.applyDragDrop(source, dest, false);
            check.notcontains(ship1.cargo, equ2);
            check.contains(ship2.cargo, equ2);

            // Third item has no more room
            source = <CharacterCargo>sheet.ship_cargo.children[0];
            dest = <CharacterFleetMember>sheet.portraits.children[1];
            equ = <CharacterEquipment>sheet.layer_equipments.children[2];
            check.same(dest.ship, ship2);
            check.same(equ.item, equ3);
            check.contains(ship1.cargo, equ3);
            equ.applyDragDrop(source, dest, false);
            check.contains(ship1.cargo, equ3);

            // Cannot transfer to escorted ship
            ship2.setCargoSpace(2);
            check.equals(equ.applyDragDrop(source, dest, true), { success: true, info: 'remove from cargo, transfer to unnamed', error: undefined });
            ship2.critical = true;
            check.equals(equ.applyDragDrop(source, dest, true), { success: false, info: 'remove from cargo, transfer to unnamed', error: 'not a fleet member' });
        });
    });
}
