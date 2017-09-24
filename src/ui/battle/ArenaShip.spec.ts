/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    describe("ArenaShip", function () {
        let testgame = setupBattleview();

        it("adds effects display", function () {
            let ship = nn(testgame.battleview.battle.playing_ship);
            let sprite = nn(testgame.battleview.arena.findShipSprite(ship));

            expect(sprite.effects_messages.children.length).toBe(0);

            sprite.displayValueChanged(new ValueChangeEvent(ship, ship.attributes.power_generation, -4));

            expect(sprite.effects_messages.children.length).toBe(1);
            let t1 = <Phaser.Text>sprite.effects_messages.getChildAt(0);
            expect(t1.text).toBe("power generation -4");

            sprite.displayValueChanged(new ValueChangeEvent(ship, ship.values.shield, 12));

            expect(sprite.effects_messages.children.length).toBe(2);
            let t2 = <Phaser.Text>sprite.effects_messages.getChildAt(1);
            expect(t2.text).toBe("shield +12");
        });

        it("adds sticky effects display", function () {
            let ship = nn(testgame.battleview.battle.playing_ship);
            let sprite = nn(testgame.battleview.arena.findShipSprite(ship));

            expect(sprite.active_effects_display.children.length).toBe(0);

            ship.addStickyEffect(new StickyEffect(new BaseEffect("test")));
            testgame.battleview.log_processor.jumpToEnd();
            expect(sprite.active_effects_display.children.length).toBe(1);

            ship.addStickyEffect(new StickyEffect(new BaseEffect("test")));
            testgame.battleview.log_processor.jumpToEnd();
            expect(sprite.active_effects_display.children.length).toBe(2);

            ship.cleanStickyEffects();
            testgame.battleview.log_processor.jumpToEnd();
            expect(sprite.active_effects_display.children.length).toBe(0);
        });
    });
}
