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

        it("allows to choose an action and a target with shortcut keys", function () {
            let battleview = testgame.battleview;
            battleview.setInteractionEnabled(true);
            let action_icon = nn(first(battleview.action_bar.action_icons, icon => icon.action.needs_target));

            expect(battleview.targetting.active).toBe(false);
            expect(battleview.action_bar.hasActionSelected()).toBe(false);
            battleview.numberPressed(battleview.action_bar.action_icons.indexOf(action_icon) + 1);
            expect(battleview.action_bar.hasActionSelected()).toBe(true);
            expect(battleview.targetting.active).toBe(true);
            expect(battleview.targetting.action).toBe(action_icon.action);
            expect(battleview.targetting.target).toBe(null);
            battleview.numberPressed(3);
            expect(battleview.targetting.active).toBe(true);
            expect(battleview.targetting.action).toBe(action_icon.action);
            expect(battleview.targetting.target).toEqual(Target.newFromShip(battleview.battle.play_order[3]));
            battleview.numberPressed(4);
            expect(battleview.targetting.active).toBe(true);
            expect(battleview.targetting.action).toBe(action_icon.action);
            expect(battleview.targetting.target).toEqual(Target.newFromShip(battleview.battle.play_order[4]));
        });
    });
}
