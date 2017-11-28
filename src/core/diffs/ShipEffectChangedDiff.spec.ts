module TK.SpaceTac.Specs {
    testing("ShipEffectChangedDiff", test => {
        test.case("applies and reverts", check => {
            let battle = TestTools.createBattle();
            let ship = battle.play_order[0];

            let effect1 = new BaseEffect("e1");
            let effect2 = new StickyEffect(new BaseEffect("e2"), 2);
            let effect3 = new StickyEffect(new BaseEffect("e3"), 3);
            ship.active_effects.add(effect1);
            ship.active_effects.add(effect2);
            ship.active_effects.add(effect3);

            TestTools.diffChain(check, battle, [
                new ShipEffectChangedDiff(ship, effect1),
                new ShipEffectChangedDiff(ship, effect2, -1),
                new ShipEffectChangedDiff(ship, effect3, 1),
            ], [
                    check => {
                        check.equals(ship.active_effects.count(), 3, "effect count");
                        check.equals(effect2.duration, 2, "duration effect2");
                        check.equals(effect3.duration, 3, "duration effect3");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 3, "effect count");
                        check.equals(effect2.duration, 2, "duration effect2");
                        check.equals(effect3.duration, 3, "duration effect3");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 3, "effect count");
                        check.equals(effect2.duration, 1, "duration effect2");
                        check.equals(effect3.duration, 3, "duration effect3");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 3, "effect count");
                        check.equals(effect2.duration, 1, "duration effect2");
                        check.equals(effect3.duration, 4, "duration effect3");
                    },
                ]);
        });

        test.case("leaves original effect untouched", check => {
            let battle = TestTools.createBattle();
            let ship = battle.play_order[0];

            let effect = new StickyEffect(new BaseEffect("effect"), 2);
            let effect_at_removal = copy(effect);
            effect_at_removal.duration = 1;

            TestTools.diffChain(check, battle, [
                new ShipEffectAddedDiff(ship, effect),
                new ShipEffectChangedDiff(ship, effect, -1),
                new ShipEffectRemovedDiff(ship, effect_at_removal),
            ], [
                    check => {
                        check.equals(ship.active_effects.count(), 0, "effect count");
                        check.equals(effect.duration, 2, "original duration");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 1, "effect count");
                        check.equals(effect.duration, 2, "original duration");
                        check.equals((<StickyEffect>nn(ship.active_effects.get(effect.id))).duration, 2, "active duration");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 1, "effect count");
                        check.equals(effect.duration, 2, "original duration");
                        check.equals((<StickyEffect>nn(ship.active_effects.get(effect.id))).duration, 1, "active duration");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 0, "effect count");
                        check.equals(effect.duration, 2, "original duration");
                    },
                ]);
        });
    });
}