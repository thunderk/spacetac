/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    describe("ShipList", function () {
        let testgame = setupBattleview();

        it("handles play position of ships", function () {
            let battleview = testgame.view;
            var list = battleview.ship_list;

            expect(battleview.battle.play_order.length).toBe(10);
            expect(list.children.length).toBe(11);

            expect(list.findPlayPosition(battleview.battle.play_order[0])).toBe(0);
            expect(list.findPlayPosition(battleview.battle.play_order[1])).toBe(1);
            expect(list.findPlayPosition(battleview.battle.play_order[2])).toBe(2);

            spyOn(battleview.battle, "playAI").and.stub();
            battleview.battle.advanceToNextShip();

            expect(list.findPlayPosition(battleview.battle.play_order[0])).toBe(9);
            expect(list.findPlayPosition(battleview.battle.play_order[1])).toBe(0);
            expect(list.findPlayPosition(battleview.battle.play_order[2])).toBe(1);
        });
    });
}
