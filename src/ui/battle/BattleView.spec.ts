/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    describe("BattleView", function () {
        let testgame = setupBattleview();

        it("handles ship hovering to display tooltip", function () {
            let battleview = testgame.view;
            expect(battleview.ship_hovered).toBeNull("initial state");

            let ship = nn(battleview.battle.playing_ship);
            battleview.cursorHovered(ship.location, ship);
            expect(battleview.ship_hovered).toBe(ship, "ship1 hovered");

            ship = nn(battleview.battle.play_order[1]);
            battleview.cursorHovered(ship.location, ship);
            expect(battleview.ship_hovered).toBe(ship, "ship2 hovered");

            battleview.cursorHovered(new ArenaLocation(0, 0), null);
            expect(battleview.ship_hovered).toBeNull("out");

            battleview.cursorOnShip(ship);
            expect(battleview.ship_hovered).toBe(ship, "force on");

            battleview.cursorOffShip(battleview.battle.play_order[2]);
            expect(battleview.ship_hovered).toBe(ship, "force off on wrong ship");

            battleview.cursorOffShip(ship);
            expect(battleview.ship_hovered).toBeNull("force off");
        });

        it("forwards cursor hovering and click to targetting", function () {
            let battleview = testgame.view;
            expect(battleview.targetting.active).toBe(false);
            battleview.setInteractionEnabled(true);

            let weapon = TestTools.addWeapon(nn(battleview.battle.playing_ship), 10);
            battleview.enterTargettingMode(nn(weapon.action), ActionTargettingMode.SPACE);
            expect(battleview.targetting.active).toBe(true);

            battleview.cursorHovered(new ArenaLocation(5, 8), null);
            expect(battleview.targetting.target).toEqual(Target.newFromLocation(5, 8));
            expect(battleview.ship_hovered).toBeNull();

            let ship = battleview.battle.play_order[3];
            battleview.cursorHovered(ship.location, ship);
            expect(battleview.targetting.target).toEqual(Target.newFromLocation(ship.arena_x, ship.arena_y));
            expect(battleview.ship_hovered).toBeNull();

            spyOn(battleview.targetting, "validate").and.stub();

            expect(battleview.targetting.validate).toHaveBeenCalledTimes(0);
            battleview.cursorClicked();
            expect(battleview.targetting.validate).toHaveBeenCalledTimes(1);

            battleview.exitTargettingMode();
            expect(battleview.targetting.active).toBe(false);

            battleview.cursorHovered(new ArenaLocation(5, 8), null);
            expect(battleview.targetting.target).toBeNull();
            expect(battleview.ship_hovered).toBeNull();

            battleview.cursorHovered(ship.location, ship);
            expect(battleview.targetting.target).toBeNull();
            expect(battleview.ship_hovered).toBe(ship);
        });

        it("allows to choose an action and a target with shortcut keys", function () {
            let battleview = testgame.view;
            battleview.setInteractionEnabled(true);
            let action_icon = battleview.action_bar.action_icons[0];

            expect(battleview.targetting.active).toBe(false);
            expect(battleview.action_bar.hasActionSelected()).toBe(false);
            battleview.numberPressed(battleview.action_bar.action_icons.indexOf(action_icon) + 1);
            expect(battleview.action_bar.hasActionSelected()).toBe(true);
            expect(battleview.targetting.active).toBe(true);
            expect(battleview.targetting.action).toBe(action_icon.action);
            expect(battleview.targetting.target).toEqual(action_icon.action.getDefaultTarget(action_icon.ship));
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
