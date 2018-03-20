module TK.SpaceTac.Specs {
    testing("StickyEffect", test => {
        test.case("applies to ship", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            check.in("before", check => {
                check.equals(ship.active_effects.count(), 0, "no sticky effect");
                check.equals(ship.getAttribute("precision"), 0, "precision");
            })

            let effect = new StickyEffect(new AttributeEffect("precision", 1), 2);
            battle.applyDiffs(effect.getOnDiffs(ship, ship));

            check.in("after", check => {
                check.equals(ship.active_effects.count(), 1, "one sticky effect");
                let sticked = ship.active_effects.list()[0];
                if (sticked instanceof StickyEffect) {
                    check.equals(sticked.base, effect.base, "sticked effect");
                    check.equals(sticked.duration, 2, "sticked duration");
                    check.equals(ship.getAttribute("precision"), 1, "precision");
                    sticked.duration = 1;
                } else {
                    check.fail("Not a sticky effect");
                }
            })

            battle.applyDiffs(effect.getOnDiffs(ship, ship));

            check.in("after second apply", check => {
                check.equals(ship.active_effects.count(), 1, "one sticky effect");
                let sticked = ship.active_effects.list()[0];
                if (sticked instanceof StickyEffect) {
                    check.equals(sticked.base, effect.base, "sticked effect");
                    check.equals(sticked.duration, 2, "sticked duration");
                    check.equals(ship.getAttribute("precision"), 1, "precision");
                } else {
                    check.fail("Not a sticky effect");
                }
            })
        });

        test.case("gets a textual description", check => {
            check.equals(new StickyEffect(new DamageEffect(10), 2).getDescription(), "do 10 damage for 2 turns");
        });
    });
}
