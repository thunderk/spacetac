module TK.SpaceTac.UI.Specs {
    testing("CharacterSheet", test => {

        testing("in UI", test => {
            let testgame = setupEmptyView(test);

            test.case("displays fleet and ship information", check => {
                let view = testgame.view;
                let sheet = new CharacterSheet(view, -1000);

                check.equals(sheet.x, -1000);

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

                check.equals(sheet.x, 0);
                check.equals(sheet.portraits.length, 2);

                check.equals(sheet.ship_name.text, "Ship 1");
                check.equals(sheet.ship_slots.length, 4);
                check.equals(sheet.ship_cargo.length, 3);

                let portrait = <Phaser.Button>sheet.portraits.getChildAt(1);
                portrait.onInputUp.dispatch();

                check.equals(sheet.ship_name.text, "Ship 2");
                check.equals(sheet.ship_slots.length, 1);
                check.equals(sheet.ship_cargo.length, 2);
            });

            test.case("moves equipment around", check => {
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

                check.equals(sheet.loot_slots.visible, false);
                check.equals(sheet.layer_equipments.children.length, 2);

                sheet.setLoot(loot);

                check.equals(sheet.loot_slots.visible, true);
                check.equals(sheet.layer_equipments.children.length, 4);

                let findsprite = (equ: Equipment) => nn(first(<CharacterEquipment[]>sheet.layer_equipments.children, sp => sp.item == equ));
                let draddrop = (sp: CharacterEquipment, dest: CharacterCargo | CharacterSlot) => {
                    sp.applyDragDrop(sp.container, dest, false);
                }

                // Unequip
                let sprite = findsprite(equ1);
                check.notequals(equ1.attached_to, null);
                check.equals(ship.cargo.length, 1);
                draddrop(sprite, <CharacterCargo>sheet.ship_cargo.children[0]);
                check.equals(equ1.attached_to, null);
                check.equals(ship.cargo.length, 2);
                check.contains(ship.cargo, equ1);

                // Equip
                sprite = findsprite(equ2);
                check.equals(equ2.attached_to, null);
                check.contains(ship.cargo, equ2);
                draddrop(sprite, <CharacterSlot>sheet.ship_slots.children[0]);
                check.same(equ2.attached_to, ship.slots[1]);
                check.notcontains(ship.cargo, equ2);

                // Loot
                sprite = findsprite(equ3);
                check.equals(equ3.attached_to, null);
                check.notcontains(ship.cargo, equ3);
                check.contains(loot, equ3);
                draddrop(sprite, <CharacterCargo>sheet.ship_cargo.children[0]);
                check.equals(equ3.attached_to, null);
                check.contains(ship.cargo, equ3);
                check.notcontains(loot, equ3);

                // Can't loop - no cargo space available
                sprite = findsprite(equ4);
                check.notcontains(ship.cargo, equ4);
                check.contains(loot, equ4);
                draddrop(sprite, <CharacterCargo>sheet.ship_cargo.children[0]);
                check.notcontains(ship.cargo, equ4);
                check.contains(loot, equ4);

                // Discard
                sprite = findsprite(equ1);
                check.contains(ship.cargo, equ1);
                check.notcontains(loot, equ1);
                draddrop(sprite, <CharacterCargo>sheet.ship_cargo.children[0]);
                check.equals(equ1.attached_to, null);
                check.notcontains(loot, equ1);

                // Can't equip - no slot available
                sprite = findsprite(equ3);
                check.equals(equ3.attached_to, null);
                draddrop(sprite, <CharacterSlot>sheet.ship_slots.children[0]);
                check.equals(equ3.attached_to, null);
            });

            test.case("controls global interactivity state", check => {
                let sheet = new CharacterSheet(testgame.view);
                check.equals(sheet.isInteractive(), false, "no ship");

                let ship = new Ship();
                ship.critical = true;
                sheet.show(ship);
                check.equals(sheet.isInteractive(), false, "critical ship");

                ship.critical = false;
                sheet.show(ship);
                check.equals(sheet.isInteractive(), true, "normal ship");

                sheet.show(ship, undefined, undefined, false);
                check.equals(sheet.isInteractive(), false, "interactivity disabled");

                sheet.show(ship);
                check.equals(sheet.isInteractive(), false, "interactivity stays disabled");

                sheet.show(ship, undefined, undefined, true);
                check.equals(sheet.isInteractive(), true, "interactivity reenabled");
            });
        });

        test.case("fits slots in area", check => {
            let result = CharacterSheet.getSlotPositions(6, 300, 200, 100, 100);
            check.equals(result, {
                positions: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 200, y: 100 }],
                scaling: 1
            });

            result = CharacterSheet.getSlotPositions(6, 299, 199, 100, 100);
            check.equals(result, {
                positions: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 200, y: 100 }],
                scaling: 0.99
            });
        });
    });
}
