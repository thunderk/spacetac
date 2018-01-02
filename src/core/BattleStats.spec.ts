module TK.SpaceTac.Specs {
    testing("BattleStats", test => {
        test.case("collects stats", check => {
            let stats = new BattleStats();
            check.equals(stats.stats, {});

            stats.addStat("Test", 1, true);
            check.equals(stats.stats, { Test: [1, 0] });

            stats.addStat("Test", 1, true);
            check.equals(stats.stats, { Test: [2, 0] });

            stats.addStat("Test", 1, false);
            check.equals(stats.stats, { Test: [2, 1] });

            stats.addStat("Other Test", 10, true);
            check.equals(stats.stats, { Test: [2, 1], "Other Test": [10, 0] });
        })

        test.case("collects damage dealt", check => {
            let stats = new BattleStats();
            let battle = new Battle();
            let attacker = battle.fleets[0].addShip();
            let defender = battle.fleets[1].addShip();
            stats.processLog(battle.log, battle.fleets[0]);
            check.equals(stats.stats, {});

            battle.log.add(new ShipDamageDiff(attacker, 10, 12));
            stats.processLog(battle.log, battle.fleets[0], true);
            check.equals(stats.stats, { "Damage dealt": [0, 22] });

            battle.log.add(new ShipDamageDiff(defender, 40, 0));
            stats.processLog(battle.log, battle.fleets[0], true);
            check.equals(stats.stats, { "Damage dealt": [40, 22] });

            battle.log.add(new ShipDamageDiff(attacker, 5, 4));
            stats.processLog(battle.log, battle.fleets[0], true);
            check.equals(stats.stats, { "Damage dealt": [40, 31] });
        })

        test.case("collects distance moved", check => {
            let stats = new BattleStats();
            let battle = new Battle();
            let attacker = battle.fleets[0].addShip();
            let defender = battle.fleets[1].addShip();
            stats.processLog(battle.log, battle.fleets[0]);
            check.equals(stats.stats, {});

            battle.log.add(new ShipMoveDiff(attacker, new ArenaLocationAngle(0, 0), new ArenaLocationAngle(10, 0)));
            stats.processLog(battle.log, battle.fleets[0], true);
            check.equals(stats.stats, { "Move distance (km)": [10, 0] });

            battle.log.add(new ShipMoveDiff(defender, new ArenaLocationAngle(10, 5), new ArenaLocationAngle(10, 63)));
            stats.processLog(battle.log, battle.fleets[0], true);
            check.equals(stats.stats, { "Move distance (km)": [10, 58] });
        })

        test.case("collects deployed drones", check => {
            let stats = new BattleStats();
            let battle = new Battle();
            let attacker = battle.fleets[0].addShip();
            let defender = battle.fleets[1].addShip();
            stats.processLog(battle.log, battle.fleets[0]);
            check.equals(stats.stats, {});

            battle.log.add(new DroneDeployedDiff(new Drone(attacker)));
            stats.processLog(battle.log, battle.fleets[0], true);
            check.equals(stats.stats, { "Drones deployed": [1, 0] });

            battle.log.add(new DroneDeployedDiff(new Drone(defender)));
            stats.processLog(battle.log, battle.fleets[0], true);
            check.equals(stats.stats, { "Drones deployed": [1, 1] });
        })

        test.case("evaluates equipment depreciation", check => {
            let stats = new BattleStats();
            let battle = new Battle();
            let attacker = battle.fleets[0].addShip();
            let defender = battle.fleets[1].addShip();

            let equ1 = TestTools.addEngine(attacker, 50);
            equ1.price = 1000;
            let equ2 = TestTools.addEngine(defender, 50);
            equ2.price = 1100;

            stats.addFleetsValue(attacker.fleet, defender.fleet);
            check.equals(stats.stats, { "Equipment wear (zotys)": [1000, 1100] });

            equ1.price = 500;
            equ2.price = 800;

            stats.addFleetsValue(attacker.fleet, defender.fleet, false);
            check.equals(stats.stats, { "Equipment wear (zotys)": [500, 300] });
        })
    })
}
