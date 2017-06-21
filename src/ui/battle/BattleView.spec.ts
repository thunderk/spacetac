/// <reference path="../TestGame.ts"/>

module TS.SpaceTac.UI.Specs {
    describe("BattleView", function () {
        let testgame = setupBattleview();

        it("forwards events in targetting mode", function () {
            let battleview = testgame.battleview;
            expect(battleview.targetting.active).toBe(false);
            battleview.setInteractionEnabled(true);

            spyOn(battleview.targetting, "validate").and.stub();

            battleview.cursorInSpace(5, 5);

            expect(battleview.targetting.active).toBe(false);

            // Enter targetting mode
            let weapon = TestTools.addWeapon(nn(battleview.battle.playing_ship), 10);
            battleview.enterTargettingMode(weapon.action);

            expect(battleview.targetting.active).toBe(true);

            // Forward selection in space
            battleview.cursorInSpace(8, 4);

            expect(battleview.ship_hovered).toBeNull();
            expect(battleview.targetting.target).toEqual(Target.newFromLocation(8, 4));

            // Process a click on space
            battleview.cursorClicked();

            // Forward ship hovering
            battleview.cursorOnShip(battleview.battle.play_order[0]);

            expect(battleview.ship_hovered).toEqual(battleview.battle.play_order[0]);
            expect(battleview.targetting.target).toEqual(Target.newFromShip(battleview.battle.play_order[0]));

            // Don't leave a ship we're not hovering
            battleview.cursorOffShip(battleview.battle.play_order[1]);

            expect(battleview.ship_hovered).toEqual(battleview.battle.play_order[0]);
            expect(battleview.targetting.target).toEqual(Target.newFromShip(battleview.battle.play_order[0]));

            // Don't move in space while on ship
            battleview.cursorInSpace(1, 3);

            expect(battleview.ship_hovered).toEqual(battleview.battle.play_order[0]);
            expect(battleview.targetting.target).toEqual(Target.newFromShip(battleview.battle.play_order[0]));

            // Process a click on ship
            battleview.cursorClicked();

            // Leave the ship
            battleview.cursorOffShip(battleview.battle.play_order[0]);

            expect(battleview.ship_hovered).toBeNull();
            expect(battleview.targetting.target).toBeNull();

            // Quit targetting
            battleview.exitTargettingMode();

            expect(battleview.targetting.active).toBe(false);

            // Events process normally
            battleview.cursorInSpace(8, 4);
            expect(battleview.ship_hovered).toBeNull();
            battleview.cursorOnShip(battleview.battle.play_order[0]);
            expect(battleview.ship_hovered).toEqual(battleview.battle.play_order[0]);

            // Quit twice don't do anything
            battleview.exitTargettingMode();
        });
    });
}
