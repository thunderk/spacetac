/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    describe("FleetCreationView", function () {
        let testgame = setupSingleView(() => [new FleetCreationView, []]);

        it("has a basic equipment shop with infinite stock", function () {
            let shop = testgame.view.infinite_shop;
            let itemcount = shop.getStock().length;
            expect(unique(shop.getStock().map(equ => equ.code)).length).toEqual(itemcount);

            let fleet = new Fleet();
            fleet.credits = 100000;
            let item = shop.getStock()[0];
            shop.sellToFleet(item, fleet);
            expect(fleet.credits).toBe(100000 - item.getPrice());
            expect(shop.getStock().length).toBe(itemcount);

            shop.buyFromFleet(item, fleet);
            expect(fleet.credits).toBe(100000);
            expect(shop.getStock().length).toBe(itemcount);
        })

        async_it("validates the fleet creation", async function () {
            expect(testgame.ui.session.isFleetCreated()).toBe(false, "no fleet created");
            expect(testgame.ui.session.player.fleet.ships.length).toBe(0, "empty session fleet");
            expect(testgame.view.dialogs_layer.children.length).toBe(0, "no dialogs");
            expect(testgame.view.character_sheet.fleet).toBe(testgame.view.built_fleet);
            expect(testgame.view.built_fleet.ships.length).toBe(2, "initial fleet should have two ships");

            // close sheet
            testClick(testgame.view.character_sheet.close_button);
            expect(testgame.view.dialogs_opened.length).toBe(1, "confirmation dialog opened");
            expect(testgame.ui.session.isFleetCreated()).toBe(false, "still no fleet created");

            // click on no in confirmation dialog
            let dialog = <UIConfirmDialog>testgame.view.dialogs_opened[0];
            await dialog.forceResult(false);
            expect(testgame.view.dialogs_opened.length).toBe(0, "confirmation dialog destroyed after 'no'");
            expect(testgame.ui.session.isFleetCreated()).toBe(false, "still no fleet created after 'no'");
            expect(testgame.state).toEqual("test_initial");

            // close sheet, click on yes in confirmation dialog
            testClick(testgame.view.character_sheet.close_button);
            dialog = <UIConfirmDialog>testgame.view.dialogs_opened[0];
            await dialog.forceResult(true);
            expect(testgame.view.dialogs_opened.length).toBe(0, "confirmation dialog destroyed after 'yes'");
            expect(testgame.ui.session.isFleetCreated()).toBe(true, "fleet created");
            expect(testgame.ui.session.player.fleet.ships.length).toBe(2, "session fleet now has two ships");
            expect(testgame.state).toEqual("router");
        })
    })
}
