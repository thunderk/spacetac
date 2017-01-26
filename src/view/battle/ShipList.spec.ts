/// <reference path="../TestGame.ts"/>

module TS.SpaceTac.View.Specs {
    describe("ShipList", () => {
        inbattleview_it("handles play position of ships", (battleview: BattleView) => {
            var list = battleview.ship_list;

            expect(list.findPlayPosition(battleview.battle.play_order[0])).toBe(0);
            expect(list.findPlayPosition(battleview.battle.play_order[1])).toBe(1);
            expect(list.findPlayPosition(battleview.battle.play_order[2])).toBe(2);

            battleview.battle.advanceToNextShip();

            expect(list.findPlayPosition(battleview.battle.play_order[0])).toBe(7);
            expect(list.findPlayPosition(battleview.battle.play_order[1])).toBe(0);
            expect(list.findPlayPosition(battleview.battle.play_order[2])).toBe(1);
        });
    });
}
