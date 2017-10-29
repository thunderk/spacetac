module TK.SpaceTac.UI.Specs {
    testing("CharacterShopSlot", test => {
        let testgame = setupEmptyView(test);

        test.case("buys and sell if bound to a shop", check => {
            let view = testgame.view;
            let sheet = new CharacterSheet(view);

            let fleet = new Fleet();
            fleet.credits = 100;
            let ship = fleet.addShip();
            ship.setCargoSpace(2);
            let equ1 = new Equipment(SlotType.Shield, "equ1");
            ship.addCargo(equ1);

            let equ2 = new Equipment(SlotType.Weapon, "equ2");
            let shop = <any>new Shop(1, [equ2], 0);
            check.patch(shop, "getPrice", () => 120);
            sheet.setShop(shop);
            sheet.show(ship);

            check.equals(ship.cargo, [equ1]);
            check.equals(shop.stock, [equ2]);
            check.equals(fleet.credits, 100);

            let cargo_slot = <CharacterCargo>sheet.ship_cargo.children[0];
            check.equals(cargo_slot instanceof CharacterCargo, true);
            let shop_slot = <CharacterShopSlot>sheet.loot_slots.children[0];
            check.equals(shop_slot instanceof CharacterShopSlot, true);

            // sell
            let equ1s = <CharacterEquipment>sheet.layer_equipments.children[0];
            check.same(equ1s.item, equ1);
            equ1s.applyDragDrop(cargo_slot, shop_slot, false);
            check.equals(ship.cargo, []);
            check.equals(shop.stock, [equ2, equ1]);
            check.equals(fleet.credits, 220);

            // buy
            let equ2s = <CharacterEquipment>sheet.layer_equipments.children[1];
            check.same(equ2s.item, equ2);
            equ2s.applyDragDrop(shop_slot, cargo_slot, false);
            check.equals(ship.cargo, [equ2]);
            check.equals(shop.stock, [equ1]);
            check.equals(fleet.credits, 100);

            // not enough money
            equ1s = <CharacterEquipment>sheet.layer_equipments.children[0];
            check.same(equ1s.item, equ1);
            equ1s.applyDragDrop(shop_slot, cargo_slot, false);
            check.equals(ship.cargo, [equ2]);
            check.equals(shop.stock, [equ1]);
            check.equals(fleet.credits, 100);
        });
    });
}
