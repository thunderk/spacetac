module TS.SpaceTac.UI.Specs {
    describe("CharacterSheet", function () {

        describe("in UI", function () {
            let testgame = setupEmptyView();

            it("displays fleet and ship information", function () {
                let view = testgame.baseview;
                let sheet = new CharacterSheet(view, -1000);

                expect(sheet.x).toEqual(-1000);

                let fleet = new Fleet();
                let ship1 = fleet.addShip();
                ship1.addSlot(SlotType.Armor);
                ship1.addSlot(SlotType.Engine);
                ship1.addSlot(SlotType.Shield);
                ship1.addSlot(SlotType.Weapon);
                ship1.name = "Ship 1";
                let ship2 = fleet.addShip();
                ship2.addSlot(SlotType.Armor);
                ship2.name = "Ship 2";

                sheet.show(ship1, false);

                expect(sheet.x).toEqual(0);
                expect(sheet.portraits.length).toBe(2);

                expect(sheet.ship_name.text).toEqual("Ship 1");
                expect(sheet.ship_slots.length).toBe(4);

                let portrait = <Phaser.Button>sheet.portraits.getChildAt(1);
                portrait.onInputUp.dispatch();

                expect(sheet.ship_name.text).toEqual("Ship 2");
                expect(sheet.ship_slots.length).toBe(1);
            });
        });

        it("fits slots in area", function () {
            let result = CharacterSheet.getSlotPositions(6, 300, 200, 100, 100);
            expect(result).toEqual({
                positions: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 200, y: 100 }],
                scaling: 1
            });
        });
    });
}
