module TK.SpaceTac.Specs {
    testing("ShipEffectAddedDiff", test => {
        test.case("applies and reverts", check => {
            let battle = TestTools.createBattle();
            let ship = battle.play_order[0];

            let effect1 = new BaseEffect("e1");
            let effect2 = new BaseEffect("e2");

            TestTools.diffChain(check, battle, [
                new ShipEffectAddedDiff(ship, effect1),
                new ShipEffectAddedDiff(ship, effect2),
                new ShipEffectRemovedDiff(ship, effect1),
                new ShipEffectRemovedDiff(ship, effect2),
            ], [
                    check => {
                        check.equals(ship.active_effects.count(), 0, "effect count");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 1, "effect count");
                        check.equals(ship.active_effects.get(effect1.id), effect1, "effect1 present");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 2, "effect count");
                        check.equals(ship.active_effects.get(effect2.id), effect2, "effect2 present");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 1, "effect count");
                        check.equals(ship.active_effects.get(effect1.id), null, "effect1 missing");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 0, "effect count");
                    },
                ]);
        });
    });
}