/// <reference path="../TestGame.ts"/>

module TS.SpaceTac.UI.Specs {
    describe("ActionTooltip", function () {
        let testgame = setupBattleview();

        it("displays action information", () => {
            let battleview = testgame.battleview;
            let bar = battleview.action_bar;
            let tooltip = bar.tooltip;

            bar.clearAll();
            let ship = nn(battleview.battle.playing_ship);
            let a1 = bar.addAction(ship, new MoveAction(new Equipment()));
            nn(a1.action.equipment).name = "Engine";
            a1.action.name = "Move";
            let a2 = bar.addAction(ship, new FireWeaponAction(new Equipment()));
            nn(a2.action.equipment).name = "Weapon";
            a2.action.name = "Fire";
            let a3 = bar.addAction(ship, new EndTurnAction());
            a3.action.name = "End turn";

            tooltip.setAction(a1);
            expect(tooltip.main_title.text).toEqual("Engine");
            expect(tooltip.sub_title.text).toEqual("Move");
            expect(tooltip.shortcut.text).toEqual("[ 1 ]");

            tooltip.setAction(a2);
            expect(tooltip.main_title.text).toEqual("Weapon");
            expect(tooltip.sub_title.text).toEqual("Fire");
            expect(tooltip.shortcut.text).toEqual("[ 2 ]");

            tooltip.setAction(a3);
            expect(tooltip.main_title.text).toEqual("End turn");
            expect(tooltip.sub_title.text).toEqual("");
            expect(tooltip.shortcut.text).toEqual("[ space ]");
        });
    });
}
