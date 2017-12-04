module TK.SpaceTac.Specs {
    testing("BattleChecks", test => {
        test.case("detects victory conditions", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[1].addShip();
            let checks = new BattleChecks(battle);
            check.equals(checks.checkVictory(), [], "no victory");

            battle.cycle = 5;
            ship1.setDead();
            check.equals(checks.checkVictory(), [new EndBattleDiff(battle.fleets[1], 5)], "victory");
        })

        test.case("fixes ship values", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[1].addShip();
            let checks = new BattleChecks(battle);
            check.equals(checks.checkShipValues(), [], "no value to fix");

            ship1.setValue("hull", -4);
            TestTools.setAttribute(ship2, "shield_capacity", 48);
            ship2.setValue("shield", 60);
            check.equals(checks.checkShipValues(), [
                new ShipValueDiff(ship1, "hull", 4),
                new ShipValueDiff(ship2, "shield", -12),
            ], "fixed values");
        })

        test.case("marks ships as dead, except the playing one", check => {
            let battle = TestTools.createBattle(1, 2);
            let [ship1, ship2, ship3] = battle.play_order;
            let checks = new BattleChecks(battle);
            check.equals(checks.checkDeadShips(), [], "no ship to mark as dead");

            battle.ships.list().forEach(ship => ship.setValue("hull", 0));

            let result = checks.checkDeadShips();
            check.equals(result, [new ShipDeathDiff(battle, ship2)], "ship2 marked as dead");
            battle.applyDiffs(result);

            result = checks.checkDeadShips();
            check.equals(result, [new ShipDeathDiff(battle, ship3)], "ship3 marked as dead");
            battle.applyDiffs(result);

            result = checks.checkDeadShips();
            check.equals(result, [], "ship1 left playing");
        })

        test.case("fixes area effects", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[1].addShip();
            let checks = new BattleChecks(battle);

            check.in("initial state", check => {
                check.equals(checks.checkAreaEffects(), [], "effects diff");
            });

            let effect1 = ship1.active_effects.add(new StickyEffect(new BaseEffect("e1")));
            let effect2 = ship1.active_effects.add(new BaseEffect("e2"));
            let effect3 = ship1.active_effects.add(new BaseEffect("e3"));
            check.patch(battle, "iAreaEffects", () => isingle(effect3));
            check.in("sticky+obsolete+missing", check => {
                check.equals(checks.checkAreaEffects(), [
                    new ShipEffectRemovedDiff(ship1, effect2),
                    new ShipEffectAddedDiff(ship2, effect3)
                ], "effects diff");
            });
        })
    })
}
