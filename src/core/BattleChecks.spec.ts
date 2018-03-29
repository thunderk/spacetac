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
            check.patch(battle, "getAreaEffects", (): [Ship, BaseEffect][] => [[ship1, effect3]]);
            check.in("sticky+obsolete+missing", check => {
                check.equals(checks.checkAreaEffects(), [
                    new ShipEffectRemovedDiff(ship1, effect2),
                    new ShipEffectAddedDiff(ship2, effect3)
                ], "effects diff");
            });
        })

        test.case("applies vigilance actions", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            ship1.setArenaPosition(100, 100);
            TestTools.setShipModel(ship1, 10, 0, 5);
            let ship2 = battle.fleets[1].addShip();
            ship2.setArenaPosition(1000, 1000);
            TestTools.setShipModel(ship2, 10);
            TestTools.setShipPlaying(battle, ship1);

            let vig1 = ship1.actions.addCustom(new VigilanceAction("Vig1", { radius: 100, filter: ActionTargettingFilter.ENEMIES }, { intruder_effects: [new DamageEffect(1)] }));
            let vig2 = ship1.actions.addCustom(new VigilanceAction("Vig2", { radius: 50, filter: ActionTargettingFilter.ENEMIES }, { intruder_effects: [new DamageEffect(2)] }));
            let vig3 = ship1.actions.addCustom(new VigilanceAction("Vig3", { radius: 100, filter: ActionTargettingFilter.ALLIES }, { intruder_effects: [new DamageEffect(3)] }));
            battle.applyOneAction(vig1.id);
            battle.applyOneAction(vig2.id);
            battle.applyOneAction(vig3.id);

            let checks = new BattleChecks(battle);
            check.in("initial state", check => {
                check.equals(checks.checkAreaEffects(), [], "effects diff");
            });

            ship2.setArenaPosition(100, 160);
            check.in("ship2 moved in range", check => {
                check.equals(checks.checkAreaEffects(), [
                    new ShipEffectAddedDiff(ship2, vig1.effects[0]),
                    new VigilanceAppliedDiff(ship1, vig1, ship2),
                    new ShipDamageDiff(ship2, 1, 0),
                    new ShipValueDiff(ship2, "hull", -1),
                ], "effects diff");
            });
        })
    })
}
