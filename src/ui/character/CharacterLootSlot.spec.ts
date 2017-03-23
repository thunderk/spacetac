module TS.SpaceTac.UI.Specs {
    describe("CharacterLootSlot", function () {
        let testgame = setupEmptyView();

        it("takes or discard loot", function () {
            let view = testgame.baseview;
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

            expect(ship.cargo).toEqual([equ1]);
            expect(loot).toEqual([equ2]);

            let cargo_slot = <CharacterCargo>sheet.ship_cargo.children[0];
            expect(cargo_slot instanceof CharacterCargo).toBe(true);
            let loot_slot = <CharacterLootSlot>sheet.loot_slots.children[0];
            expect(loot_slot instanceof CharacterLootSlot).toBe(true);

            // loot to cargo
            let equ2s = <CharacterEquipment>sheet.equipments.children[1];
            expect(equ2s.item).toBe(equ2);
            equ2s.applyDragDrop(loot_slot, cargo_slot, false);
            expect(ship.cargo).toEqual([equ1, equ2]);
            expect(loot).toEqual([]);

            // discard to cargo
            let equ1s = <CharacterEquipment>sheet.equipments.children[0];
            expect(equ1s.item).toBe(equ1);
            equ1s.applyDragDrop(cargo_slot, loot_slot, false);
            expect(ship.cargo).toEqual([equ2]);
            expect(loot).toEqual([equ1]);
        });
    });
}
