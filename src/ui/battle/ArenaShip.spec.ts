/// <reference path="../TestGame.ts"/>

module TS.SpaceTac.UI.Specs {
    describe("ArenaShip", function () {
        let testgame = setupBattleview();

        it("adds effects display", function () {
            let ship = testgame.battleview.battle.playing_ship;
            let sprite = testgame.battleview.arena.findShipSprite(ship);

            expect(sprite.effects.children.length).toBe(0);

            sprite.displayValueChanged(new ValueChangeEvent(ship, ship.attributes.power_recovery, -4));

            expect(sprite.effects.children.length).toBe(1);
            let t1 = <Phaser.Text>sprite.effects.getChildAt(0);
            expect(t1.text).toBe("power recovery -4");

            sprite.displayValueChanged(new ValueChangeEvent(ship, ship.values.shield, 12));

            expect(sprite.effects.children.length).toBe(2);
            let t2 = <Phaser.Text>sprite.effects.getChildAt(1);
            expect(t2.text).toBe("shield +12");
        });
    });
}
