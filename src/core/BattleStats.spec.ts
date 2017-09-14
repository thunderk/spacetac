module TS.SpaceTac.Specs {
    describe("BattleStats", function () {
        it("collects stats", function () {
            let stats = new BattleStats();
            expect(stats.stats).toEqual({});

            stats.addStat("Test", 1, true);
            expect(stats.stats).toEqual({ Test: [1, 0] });

            stats.addStat("Test", 1, true);
            expect(stats.stats).toEqual({ Test: [2, 0] });

            stats.addStat("Test", 1, false);
            expect(stats.stats).toEqual({ Test: [2, 1] });

            stats.addStat("Other Test", 10, true);
            expect(stats.stats).toEqual({ Test: [2, 1], "Other Test": [10, 0] });
        })

        it("collects damage dealt", function () {
            let stats = new BattleStats();
            let battle = new Battle();
            let attacker = battle.fleets[0].addShip();
            let defender = battle.fleets[1].addShip();
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({});

            battle.log.add(new DamageEvent(attacker, 10, 12));
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({ "Damage dealt": [0, 22] });

            battle.log.add(new DamageEvent(defender, 40, 0));
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({ "Damage dealt": [40, 22] });

            battle.log.add(new DamageEvent(attacker, 5, 4));
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({ "Damage dealt": [40, 31] });
        })

        it("collects distance moved", function () {
            let stats = new BattleStats();
            let battle = new Battle();
            let attacker = battle.fleets[0].addShip();
            let defender = battle.fleets[1].addShip();
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({});

            battle.log.add(new MoveEvent(attacker, new ArenaLocationAngle(0, 0), new ArenaLocationAngle(10, 0)));
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({ "Move distance (km)": [10, 0] });

            battle.log.add(new MoveEvent(defender, new ArenaLocationAngle(10, 5), new ArenaLocationAngle(10, 63)));
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({ "Move distance (km)": [10, 58] });
        })

        it("collects deployed drones", function () {
            let stats = new BattleStats();
            let battle = new Battle();
            let attacker = battle.fleets[0].addShip();
            let defender = battle.fleets[1].addShip();
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({});

            battle.log.add(new DroneDeployedEvent(new Drone(attacker)));
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({ "Drones deployed": [1, 0] });

            battle.log.add(new DroneDeployedEvent(new Drone(defender)));
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({ "Drones deployed": [1, 1] });
        })

        it("collects power usage", function () {
            let stats = new BattleStats();
            let battle = new Battle();
            let attacker = battle.fleets[0].addShip();
            let defender = battle.fleets[1].addShip();
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({});

            battle.log.add(new ActionAppliedEvent(attacker, new BaseAction("nop", "nop", false), null, 4));
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({ "Power used": [4, 0] });

            battle.log.add(new ActionAppliedEvent(defender, new BaseAction("nop", "nop", false), null, 2));
            stats.processLog(battle.log, battle.fleets[0]);
            expect(stats.stats).toEqual({ "Power used": [4, 2] });
        })
    })
}
