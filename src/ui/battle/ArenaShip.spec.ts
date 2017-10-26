/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("ArenaShip", test => {
        let testgame = setupBattleview();

        test.case("adds effects display", check => {
            let ship = nn(testgame.view.battle.playing_ship);
            let sprite = nn(testgame.view.arena.findShipSprite(ship));

            check.equals(sprite.effects_messages.children.length, 0);

            sprite.displayValueChanged(new ValueChangeEvent(ship, ship.attributes.power_generation, -4));

            check.equals(sprite.effects_messages.children.length, 1);
            let t1 = <Phaser.Text>sprite.effects_messages.getChildAt(0);
            check.equals(t1.text, "power generation -4");

            sprite.displayValueChanged(new ValueChangeEvent(ship, ship.values.shield, 12));

            check.equals(sprite.effects_messages.children.length, 2);
            let t2 = <Phaser.Text>sprite.effects_messages.getChildAt(1);
            check.equals(t2.text, "shield +12");
        });

        test.case("adds sticky effects display", check => {
            let ship = nn(testgame.view.battle.playing_ship);
            let sprite = nn(testgame.view.arena.findShipSprite(ship));

            check.equals(sprite.active_effects_display.children.length, 0);

            ship.addStickyEffect(new StickyEffect(new BaseEffect("test")));
            testgame.view.log_processor.jumpToEnd();
            check.equals(sprite.active_effects_display.children.length, 1);

            ship.addStickyEffect(new StickyEffect(new BaseEffect("test")));
            testgame.view.log_processor.jumpToEnd();
            check.equals(sprite.active_effects_display.children.length, 2);

            ship.cleanStickyEffects();
            testgame.view.log_processor.jumpToEnd();
            check.equals(sprite.active_effects_display.children.length, 0);
        });
    });
}
