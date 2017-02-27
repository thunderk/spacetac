module TS.SpaceTac.UI.Specs {
    describe("CharacterSheet", function () {
        let testgame = setupEmptyView();

        it("displays fleet and ship information", function () {
            let view = testgame.baseview;
            let sheet = new CharacterSheet(view);

            expect(sheet.x).toEqual(-sheet.width);

            let fleet = new Fleet();
            let ship1 = fleet.addShip();
            ship1.name = "Ship 1";
            let ship2 = fleet.addShip();
            ship2.name = "Ship 2";

            sheet.show(ship1, false);

            expect(sheet.x).toEqual(0);
            expect(sheet.portraits.length).toBe(2);
            expect(sheet.ship_name.text).toEqual("Ship 1");

            let portrait = <Phaser.Button>sheet.portraits.getChildAt(1);
            portrait.onInputUp.dispatch();

            expect(sheet.ship_name.text).toEqual("Ship 2");
        });
    });
}
