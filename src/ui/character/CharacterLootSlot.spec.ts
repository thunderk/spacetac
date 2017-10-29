module TK.SpaceTac.UI.Specs {
    testing("CharacterLootSlot", test => {
        let testgame = setupEmptyView(test);

        test.case("takes or discard loot", check => {
            let view = testgame.view;
            let sheet = new CharacterSheet(view);

            let fleet = new Fleet();
            let ship = fleet.addShip();
            ship.setCargoSpace(2);
            let equ1 = new Equipment(SlotType.Shield, "equ1");
            ship.addCargo(equ1)

            let equ2 = new Equipment(SlotType.Weapon, "equ2");
            let loot = [equ2];
            sheet.setLoot(loot);
            sheet.show(ship);

            check.equals(ship.cargo, [equ1]);
            check.equals(loot, [equ2]);

            let cargo_slot = <CharacterCargo>sheet.ship_cargo.children[0];
            check.equals(cargo_slot instanceof CharacterCargo, true);
            let loot_slot = <CharacterLootSlot>sheet.loot_slots.children[0];
            check.equals(loot_slot instanceof CharacterLootSlot, true);

            // loot to cargo
            let equ2s = <CharacterEquipment>sheet.layer_equipments.children[1];
            check.same(equ2s.item, equ2);
            equ2s.applyDragDrop(loot_slot, cargo_slot, false);
            check.equals(ship.cargo, [equ1, equ2]);
            check.equals(loot, []);

            // discard to cargo
            let equ1s = <CharacterEquipment>sheet.layer_equipments.children[0];
            check.same(equ1s.item, equ1);
            equ1s.applyDragDrop(cargo_slot, loot_slot, false);
            check.equals(ship.cargo, [equ2]);
            check.equals(loot, [equ1]);
        });
    });
}
