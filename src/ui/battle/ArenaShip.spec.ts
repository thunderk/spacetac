/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("ArenaShip", test => {
        let testgame = setupBattleview(test);

        test.case("adds effects display", check => {
            let ship = nn(testgame.view.battle.playing_ship);
            let sprite = nn(testgame.view.arena.findShipSprite(ship));

            check.equals(sprite.effects_messages.children.length, 0);

            sprite.displayAttributeChanged(new ShipAttributeDiff(ship, "power_capacity", { cumulative: -4 }, {}));

            check.equals(sprite.effects_messages.children.length, 1);
            let t1 = <Phaser.Text>sprite.effects_messages.getChildAt(0);
            check.equals(t1.text, "power capacity -4");
        });

        test.case("adds sticky effects display", check => {
            let battle = testgame.view.actual_battle;
            let ship = nn(battle.playing_ship);
            let sprite = nn(testgame.view.arena.findShipSprite(ship));

            check.equals(sprite.active_effects_display.children.length, 0);

            let effect1 = new StickyEffect(new BaseEffect("test"));
            battle.applyDiffs([new ShipEffectAddedDiff(ship, effect1)]);
            testgame.view.log_processor.processPending();
            check.equals(sprite.active_effects_display.children.length, 1);

            let effect2 = new StickyEffect(new BaseEffect("test"));
            battle.applyDiffs([new ShipEffectAddedDiff(ship, effect2)]);
            testgame.view.log_processor.processPending();
            check.equals(sprite.active_effects_display.children.length, 2);

            battle.applyDiffs([new ShipEffectRemovedDiff(ship, effect1)]);
            testgame.view.log_processor.processPending();
            check.equals(sprite.active_effects_display.children.length, 1);

            battle.applyDiffs([new ShipEffectRemovedDiff(ship, effect2)]);
            testgame.view.log_processor.processPending();
            check.equals(sprite.active_effects_display.children.length, 0);
        });
    });
}
