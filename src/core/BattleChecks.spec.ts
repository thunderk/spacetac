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

        test.case("marks ships as dead", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[1].addShip();
            let ship3 = battle.fleets[1].addShip();
            battle.ships.list().forEach(ship => TestTools.setShipHP(ship, 10, 0));
            let checks = new BattleChecks(battle);
            check.equals(checks.checkDeadShips(), [], "no ship to mark as dead");

            ship1.setValue("hull", 0);
            ship3.setValue("hull", 0);
            check.equals(checks.checkDeadShips(), [
                new ShipDeathDiff(battle, ship1),
                new ShipDeathDiff(battle, ship3),
            ], "2 ships to mark as dead");
        })
    })
}
