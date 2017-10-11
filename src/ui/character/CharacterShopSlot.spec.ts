module TK.SpaceTac.UI.Specs {
    describe("CharacterShopSlot", function () {
        let testgame = setupEmptyView();

        it("buys and sell if bound to a shop", function () {
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
            spyOn(shop, "getPrice").and.returnValue(120);
            sheet.setShop(shop);
            sheet.show(ship);

            expect(ship.cargo).toEqual([equ1]);
            expect(shop.stock).toEqual([equ2]);
            expect(fleet.credits).toBe(100);

            let cargo_slot = <CharacterCargo>sheet.ship_cargo.children[0];
            expect(cargo_slot instanceof CharacterCargo).toBe(true);
            let shop_slot = <CharacterShopSlot>sheet.loot_slots.children[0];
            expect(shop_slot instanceof CharacterShopSlot).toBe(true);

            // sell
            let equ1s = <CharacterEquipment>sheet.layer_equipments.children[0];
            expect(equ1s.item).toBe(equ1);
            equ1s.applyDragDrop(cargo_slot, shop_slot, false);
            expect(ship.cargo).toEqual([]);
            expect(shop.stock).toEqual([equ2, equ1]);
            expect(fleet.credits).toBe(220);

            // buy
            let equ2s = <CharacterEquipment>sheet.layer_equipments.children[1];
            expect(equ2s.item).toBe(equ2);
            equ2s.applyDragDrop(shop_slot, cargo_slot, false);
            expect(ship.cargo).toEqual([equ2]);
            expect(shop.stock).toEqual([equ1]);
            expect(fleet.credits).toBe(100);

            // not enough money
            equ1s = <CharacterEquipment>sheet.layer_equipments.children[0];
            expect(equ1s.item).toBe(equ1);
            equ1s.applyDragDrop(shop_slot, cargo_slot, false);
            expect(ship.cargo).toEqual([equ2]);
            expect(shop.stock).toEqual([equ1]);
            expect(fleet.credits).toBe(100);
        });
    });
}
