/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("FleetCreationView", test => {
        let testgame = setupSingleView(test, () => [new FleetCreationView, []]);

        test.acase("validates the fleet creation", async check => {
            check.same(testgame.ui.session.isFleetCreated(), false, "no fleet created");
            check.same(testgame.ui.session.player.fleet.ships.length, 0, "empty session fleet");
            check.same(testgame.view.dialogs_layer.children.length, 0, "no dialogs");
            check.same(testgame.view.character_sheet.fleet, testgame.view.built_fleet);
            check.same(testgame.view.built_fleet.ships.length, 2, "initial fleet should have two ships");

            // close sheet
            testClick(testgame.view.character_sheet.close_button);
            check.same(testgame.view.dialogs_opened.length, 1, "confirmation dialog opened");
            check.same(testgame.ui.session.isFleetCreated(), false, "still no fleet created");

            // click on no in confirmation dialog
            let dialog = <UIConfirmDialog>testgame.view.dialogs_opened[0];
            await dialog.forceResult(false);
            check.same(testgame.view.dialogs_opened.length, 0, "confirmation dialog destroyed after 'no'");
            check.same(testgame.ui.session.isFleetCreated(), false, "still no fleet created after 'no'");
            check.equals(testgame.state, "test_initial");

            // close sheet, click on yes in confirmation dialog
            testClick(testgame.view.character_sheet.close_button);
            dialog = <UIConfirmDialog>testgame.view.dialogs_opened[0];
            await dialog.forceResult(true);
            check.same(testgame.view.dialogs_opened.length, 0, "confirmation dialog destroyed after 'yes'");
            check.same(testgame.ui.session.isFleetCreated(), true, "fleet created");
            check.same(testgame.ui.session.player.fleet.ships.length, 2, "session fleet now has two ships");
            check.equals(testgame.state, "router");
        })
    })
}
