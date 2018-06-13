module TK.SpaceTac.Specs {
    testing("PinnedEffect", test => {
        test.case("shows a textual description", check => {
            check.equals(new PinnedEffect().getDescription(), "pinned");
            check.equals(new PinnedEffect(true).getDescription(), "anchored");
        });

        test.case("prevents a ship from using its engine", check => {
            let ship = new Ship();
            TestTools.setShipModel(ship, 1, 1, 1);

            let engine = TestTools.addEngine(ship, 100);
            check.equals(engine.checkCannotBeApplied(ship), null, "engine can initially be used");

            let cases: [string, BaseEffect][] = [
                ["soft pin", new PinnedEffect()],
                ["hard pin", new PinnedEffect(true)],
                ["sticky soft pin", new StickyEffect(new PinnedEffect())],
                ["sticky hard pin", new StickyEffect(new PinnedEffect(true))],
            ];
            cases.forEach(([title, effect]) => {
                check.in(title, check => {
                    ship.active_effects.add(effect);
                    check.equals(engine.checkCannotBeApplied(ship), ActionUnavailability.PINNED, "engine cannot be used when pinned");
                    ship.active_effects.remove(effect);
                    check.equals(engine.checkCannotBeApplied(ship), null, "engine can be used again");
                });
            });
        });

        test.case("prevents a ship from being moved by another effect, in hard mode", check => {
            let battle = TestTools.createBattle();
            let ship = battle.fleets[0].ships[0];
            let enemy = battle.fleets[1].ships[0];
            enemy.setArenaPosition(0, 500);

            let effect = new RepelEffect(100);
            check.equals(effect.getOnDiffs(enemy, ship).length, 1, "ship can initially be moved");

            check.in("soft pin", check => {
                let pin = enemy.active_effects.add(new PinnedEffect());
                check.equals(effect.getOnDiffs(enemy, ship).length, 1, "ship can still be moved");
                enemy.active_effects.remove(pin);
                check.equals(effect.getOnDiffs(enemy, ship).length, 1, "ship can still be moved");
            });

            check.in("hard pin", check => {
                let pin = enemy.active_effects.add(new PinnedEffect(true));
                check.equals(effect.getOnDiffs(enemy, ship).length, 0, "ship cannot be moved");
                enemy.active_effects.remove(pin);
                check.equals(effect.getOnDiffs(enemy, ship).length, 1, "ship can be moved again");
            });

            check.in("sticky hard pin", check => {
                let pin = enemy.active_effects.add(new StickyEffect(new PinnedEffect(true)));
                check.equals(effect.getOnDiffs(enemy, ship).length, 0, "ship cannot be moved");
                enemy.active_effects.remove(pin);
                check.equals(effect.getOnDiffs(enemy, ship).length, 1, "ship can be moved again");
            });
        });
    });
}
