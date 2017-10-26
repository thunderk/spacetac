/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("BattleView", test => {
        let testgame = setupBattleview();

        test.case("handles ship hovering to display tooltip", check => {
            let battleview = testgame.view;
            expect(battleview.ship_hovered).toBeNull("initial state");

            let ship = nn(battleview.battle.playing_ship);
            battleview.cursorHovered(ship.location, ship);
            check.same(battleview.ship_hovered, ship, "ship1 hovered");

            ship = nn(battleview.battle.play_order[1]);
            battleview.cursorHovered(ship.location, ship);
            check.same(battleview.ship_hovered, ship, "ship2 hovered");

            battleview.cursorHovered(new ArenaLocation(0, 0), null);
            expect(battleview.ship_hovered).toBeNull("out");

            battleview.cursorOnShip(ship);
            check.same(battleview.ship_hovered, ship, "force on");

            battleview.cursorOffShip(battleview.battle.play_order[2]);
            check.same(battleview.ship_hovered, ship, "force off on wrong ship");

            battleview.cursorOffShip(ship);
            expect(battleview.ship_hovered).toBeNull("force off");
        });

        test.case("forwards cursor hovering and click to targetting", check => {
            let battleview = testgame.view;
            check.equals(battleview.targetting.active, false);
            battleview.setInteractionEnabled(true);

            let weapon = TestTools.addWeapon(nn(battleview.battle.playing_ship), 10);
            battleview.enterTargettingMode(nn(weapon.action), ActionTargettingMode.SPACE);
            check.equals(battleview.targetting.active, true);

            battleview.cursorHovered(new ArenaLocation(5, 8), null);
            check.equals(battleview.targetting.target, Target.newFromLocation(5, 8));
            check.equals(battleview.ship_hovered, null);

            let ship = battleview.battle.play_order[3];
            battleview.cursorHovered(ship.location, ship);
            check.equals(battleview.targetting.target, Target.newFromLocation(ship.arena_x, ship.arena_y));
            check.equals(battleview.ship_hovered, null);

            spyOn(battleview.targetting, "validate").and.stub();

            expect(battleview.targetting.validate).toHaveBeenCalledTimes(0);
            battleview.cursorClicked();
            expect(battleview.targetting.validate).toHaveBeenCalledTimes(1);

            battleview.exitTargettingMode();
            check.equals(battleview.targetting.active, false);

            battleview.cursorHovered(new ArenaLocation(5, 8), null);
            check.equals(battleview.targetting.target, null);
            check.equals(battleview.ship_hovered, null);

            battleview.cursorHovered(ship.location, ship);
            check.equals(battleview.targetting.target, null);
            check.same(battleview.ship_hovered, ship);
        });

        test.case("allows to choose an action and a target with shortcut keys", check => {
            let battleview = testgame.view;
            battleview.setInteractionEnabled(true);
            let action_icon = battleview.action_bar.action_icons[0];

            check.equals(battleview.targetting.active, false);
            check.equals(battleview.action_bar.hasActionSelected(), false);
            battleview.numberPressed(battleview.action_bar.action_icons.indexOf(action_icon) + 1);
            check.equals(battleview.action_bar.hasActionSelected(), true);
            check.equals(battleview.targetting.active, true);
            check.same(battleview.targetting.action, action_icon.action);
            check.equals(battleview.targetting.target, action_icon.action.getDefaultTarget(action_icon.ship));
            battleview.numberPressed(3);
            check.equals(battleview.targetting.active, true);
            check.same(battleview.targetting.action, action_icon.action);
            check.equals(battleview.targetting.target, Target.newFromShip(battleview.battle.play_order[3]));
            battleview.numberPressed(4);
            check.equals(battleview.targetting.active, true);
            check.same(battleview.targetting.action, action_icon.action);
            check.equals(battleview.targetting.target, Target.newFromShip(battleview.battle.play_order[4]));
        });
    });
}
