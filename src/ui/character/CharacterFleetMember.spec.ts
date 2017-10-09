module TK.SpaceTac.UI.Specs {
    describe("CharacterFleetMember", function () {
        let testgame = setupEmptyView();

        it("transfers equipment to another ship", function () {
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
            expect(sheet.portraits.length).toBe(2);
            expect(sheet.equipments.length).toBe(3);
            expect(sheet.ship_cargo.length).toBe(3);

            // First item fits in the free slot
            let source = <CharacterCargo>sheet.ship_cargo.children[0];
            let dest = <CharacterFleetMember>sheet.portraits.children[1];
            let equ = <CharacterEquipment>sheet.equipments.children[0];
            expect(dest.ship).toBe(ship2);
            expect(equ.item).toBe(equ1);
            expect(ship1.cargo).toContain(equ1);
            expect(ship2engine.attached).toBe(null);
            equ.applyDragDrop(source, dest, false);
            expect(ship1.cargo).not.toContain(equ1);
            expect(ship2engine.attached).toBe(equ1);

            // Second item goes to cargo
            source = <CharacterCargo>sheet.ship_cargo.children[0];
            dest = <CharacterFleetMember>sheet.portraits.children[1];
            equ = <CharacterEquipment>sheet.equipments.children[1];
            expect(dest.ship).toBe(ship2);
            expect(equ.item).toBe(equ2);
            expect(ship1.cargo).toContain(equ2);
            expect(ship2.cargo).not.toContain(equ2);
            equ.applyDragDrop(source, dest, false);
            expect(ship1.cargo).not.toContain(equ2);
            expect(ship2.cargo).toContain(equ2);

            // Third item has no more room
            source = <CharacterCargo>sheet.ship_cargo.children[0];
            dest = <CharacterFleetMember>sheet.portraits.children[1];
            equ = <CharacterEquipment>sheet.equipments.children[2];
            expect(dest.ship).toBe(ship2);
            expect(equ.item).toBe(equ3);
            expect(ship1.cargo).toContain(equ3);
            equ.applyDragDrop(source, dest, false);
            expect(ship1.cargo).toContain(equ3);

            // Cannot transfer to escorted ship
            ship2.setCargoSpace(2);
            expect(equ.applyDragDrop(source, dest, true)).toBe(true);
            ship2.critical = true;
            expect(equ.applyDragDrop(source, dest, true)).toBe(false);
        });
    });
}
