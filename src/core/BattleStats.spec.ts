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

            battle.log.add(new ShipDamageDiff(defender, 1, 3, 2));
            stats.processLog(battle.log, battle.fleets[0], true);
            check.equals(stats.stats, { "Damage taken": [0, 1], "Damage shielded": [0, 3], "Damage evaded": [0, 2] });

            battle.log.add(new ShipDamageDiff(attacker, 2, 1, 3));
            stats.processLog(battle.log, battle.fleets[0], true);
            check.equals(stats.stats, { "Damage taken": [2, 1], "Damage shielded": [1, 3], "Damage evaded": [3, 2] });

            battle.log.add(new ShipDamageDiff(defender, 1, 1, 1));
            stats.processLog(battle.log, battle.fleets[0], true);
            check.equals(stats.stats, { "Damage taken": [2, 2], "Damage shielded": [1, 4], "Damage evaded": [3, 3] });
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
    })
}
