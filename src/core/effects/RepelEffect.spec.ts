module TK.SpaceTac.Specs {
    testing("RepelEffect", test => {
        test.case("shows a textual description", check => {
            check.equals(new RepelEffect(34).getDescription(), "repel ships 34km away");
        })

        test.case("repel other ships from a central point", check => {
            let battle = new Battle();
            let ship1a = battle.fleets[0].addShip();
            ship1a.setArenaPosition(100, 100);
            let ship1b = battle.fleets[0].addShip();
            ship1b.setArenaPosition(250, 100);
            let ship2a = battle.fleets[1].addShip();
            ship2a.setArenaPosition(100, 280);

            let effect = new RepelEffect(12);
            battle.applyDiffs(effect.getOnDiffs(ship1a, ship1a, 1));
            battle.applyDiffs(effect.getOnDiffs(ship1b, ship1a, 1));
            battle.applyDiffs(effect.getOnDiffs(ship2a, ship1a, 1));

            check.equals(ship1a.location, new ArenaLocationAngle(100, 100));
            check.equals(ship1b.location, new ArenaLocationAngle(262, 100));
            check.equals(ship2a.location, new ArenaLocationAngle(100, 292));
        })

        test.case("does not push a ship inside a hard exclusion area", check => {
            let battle = new Battle();
            let ship1a = battle.fleets[0].addShip();
            ship1a.setArenaPosition(100, 100);
            let ship2a = battle.fleets[1].addShip();
            ship2a.setArenaPosition(100, 200);
            let ship2b = battle.fleets[1].addShip();
            ship2b.setArenaPosition(100, 350);

            let effect = new RepelEffect(85);
            battle.applyDiffs(effect.getOnDiffs(ship2a, ship1a, 1));
            check.equals(ship2a.location, new ArenaLocationAngle(100, 250));
        })
    })
}
