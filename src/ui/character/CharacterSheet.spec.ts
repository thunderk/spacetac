module TK.SpaceTac.UI.Specs {
    describe("CharacterSheet", function () {

        describe("in UI", function () {
            let testgame = setupEmptyView();

            it("displays fleet and ship information", function () {
                let view = testgame.view;
                let sheet = new CharacterSheet(view, -1000);

                expect(sheet.x).toEqual(-1000);

                let fleet = new Fleet();
                let ship1 = fleet.addShip();
                ship1.addSlot(SlotType.Hull);
                ship1.addSlot(SlotType.Engine);
                ship1.addSlot(SlotType.Shield);
                ship1.addSlot(SlotType.Weapon);
                ship1.setCargoSpace(3);
                ship1.name = "Ship 1";
                let ship2 = fleet.addShip();
                ship2.addSlot(SlotType.Hull);
                ship2.name = "Ship 2";
                ship2.setCargoSpace(2);

                sheet.show(ship1, false);

                expect(sheet.x).toEqual(0);
                expect(sheet.portraits.length).toBe(2);

                expect(sheet.ship_name.text).toEqual("Player's Level 1 Ship 1");
                expect(sheet.ship_slots.length).toBe(4);
                expect(sheet.ship_cargo.length).toBe(3);

                let portrait = <Phaser.Button>sheet.portraits.getChildAt(1);
                portrait.onInputUp.dispatch();

                expect(sheet.ship_name.text).toEqual("Player's Level 1 Ship 2");
                expect(sheet.ship_slots.length).toBe(1);
                expect(sheet.ship_cargo.length).toBe(2);
            });

            it("moves equipment around", function () {
                let fleet = new Fleet();
                let ship = fleet.addShip();
                ship.setCargoSpace(2);
                let equ1 = TestTools.addEngine(ship, 1);
                let equ2 = new Equipment(SlotType.Weapon);
                ship.addCargo(equ2);
                let equ3 = new Equipment(SlotType.Hull);
                let equ4 = new Equipment(SlotType.Power);
                let loot = [equ3, equ4];
                ship.addSlot(SlotType.Weapon);

                let sheet = new CharacterSheet(testgame.view);
                sheet.show(ship, false);

                expect(sheet.loot_slots.visible).toBe(false);
                expect(sheet.layer_equipments.children.length).toBe(2);

                sheet.setLoot(loot);

                expect(sheet.loot_slots.visible).toBe(true);
                expect(sheet.layer_equipments.children.length).toBe(4);

                let findsprite = (equ: Equipment) => nn(first(<CharacterEquipment[]>sheet.layer_equipments.children, sp => sp.item == equ));
                let draddrop = (sp: CharacterEquipment, dest: CharacterCargo | CharacterSlot) => {
                    sp.applyDragDrop(sp.container, dest, false);
                }

                // Unequip
                let sprite = findsprite(equ1);
                expect(equ1.attached_to).not.toBeNull();
                expect(ship.cargo.length).toBe(1);
                draddrop(sprite, <CharacterCargo>sheet.ship_cargo.children[0]);
                expect(equ1.attached_to).toBeNull();
                expect(ship.cargo.length).toBe(2);
                expect(ship.cargo).toContain(equ1);

                // Equip
                sprite = findsprite(equ2);
                expect(equ2.attached_to).toBeNull();
                expect(ship.cargo).toContain(equ2);
                draddrop(sprite, <CharacterSlot>sheet.ship_slots.children[0]);
                expect(equ2.attached_to).toBe(ship.slots[1]);
                expect(ship.cargo).not.toContain(equ2);

                // Loot
                sprite = findsprite(equ3);
                expect(equ3.attached_to).toBeNull();
                expect(ship.cargo).not.toContain(equ3);
                expect(loot).toContain(equ3);
                draddrop(sprite, <CharacterCargo>sheet.ship_cargo.children[0]);
                expect(equ3.attached_to).toBeNull();
                expect(ship.cargo).toContain(equ3);
                expect(loot).not.toContain(equ3);

                // Can't loop - no cargo space available
                sprite = findsprite(equ4);
                expect(ship.cargo).not.toContain(equ4);
                expect(loot).toContain(equ4);
                draddrop(sprite, <CharacterCargo>sheet.ship_cargo.children[0]);
                expect(ship.cargo).not.toContain(equ4);
                expect(loot).toContain(equ4);

                // Discard
                sprite = findsprite(equ1);
                expect(ship.cargo).toContain(equ1);
                expect(loot).not.toContain(equ1);
                draddrop(sprite, <CharacterCargo>sheet.ship_cargo.children[0]);
                expect(equ1.attached_to).toBeNull();
                expect(loot).not.toContain(equ1);

                // Can't equip - no slot available
                sprite = findsprite(equ3);
                expect(equ3.attached_to).toBeNull();
                draddrop(sprite, <CharacterSlot>sheet.ship_slots.children[0]);
                expect(equ3.attached_to).toBeNull();
            });
        });

        it("fits slots in area", function () {
            let result = CharacterSheet.getSlotPositions(6, 300, 200, 100, 100);
            expect(result).toEqual({
                positions: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 200, y: 100 }],
                scaling: 1
            });

            result = CharacterSheet.getSlotPositions(6, 299, 199, 100, 100);
            expect(result).toEqual({
                positions: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 200, y: 100 }],
                scaling: 0.99
            });
        });
    });
}
