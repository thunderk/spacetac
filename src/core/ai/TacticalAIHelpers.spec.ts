module TS.SpaceTac.Specs {
    describe("TacticalAIHelpers", function () {
        it("produces direct weapon shots", function () {
            let battle = new Battle();
            let ship0a = battle.fleets[0].addShip(new Ship(null, "0A"));
            let ship0b = battle.fleets[0].addShip(new Ship(null, "0B"));
            let ship1a = battle.fleets[1].addShip(new Ship(null, "1A"));
            let ship1b = battle.fleets[1].addShip(new Ship(null, "1B"));

            TestTools.setShipAP(ship0a, 10);
            battle.playing_ship = ship0a;

            let result = imaterialize(TacticalAIHelpers.produceDirectShots(ship0a, battle));
            expect(result.length).toBe(0);

            let weapon1 = TestTools.addWeapon(ship0a, 10);
            let weapon2 = TestTools.addWeapon(ship0a, 15);
            result = imaterialize(TacticalAIHelpers.produceDirectShots(ship0a, battle));
            expect(result.length).toBe(4);
            expect(result).toContain(new Maneuver(ship0a, weapon1.action, Target.newFromShip(ship1a)));
            expect(result).toContain(new Maneuver(ship0a, weapon1.action, Target.newFromShip(ship1b)));
            expect(result).toContain(new Maneuver(ship0a, weapon2.action, Target.newFromShip(ship1a)));
            expect(result).toContain(new Maneuver(ship0a, weapon2.action, Target.newFromShip(ship1b)));
        });

        it("produces random moves inside a grid", function () {
            let battle = new Battle();
            battle.width = 100;
            battle.height = 100;
            let ship = battle.fleets[0].addShip();

            TestTools.setShipAP(ship, 10);
            battle.playing_ship = ship;

            let result = imaterialize(TacticalAIHelpers.produceRandomMoves(ship, battle, 2, 1));
            expect(result.length).toBe(0);

            let engine = TestTools.addEngine(ship, 1000);

            result = imaterialize(TacticalAIHelpers.produceRandomMoves(ship, battle, 2, 1, new SkewedRandomGenerator([0.5], true)));
            expect(result).toEqual([
                new Maneuver(ship, engine.action, Target.newFromLocation(25, 25)),
                new Maneuver(ship, engine.action, Target.newFromLocation(75, 25)),
                new Maneuver(ship, engine.action, Target.newFromLocation(25, 75)),
                new Maneuver(ship, engine.action, Target.newFromLocation(75, 75)),
            ]);
        });

        it("produces blast shots", function () {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            let weapon = TestTools.addWeapon(ship, 50, 1, 1000, 105);

            TestTools.setShipAP(ship, 10);
            battle.playing_ship = ship;

            let result = imaterialize(TacticalAIHelpers.produceBlastShots(ship, battle));
            expect(result.length).toBe(0);

            let enemy1 = battle.fleets[1].addShip();
            enemy1.setArenaPosition(500, 0);

            result = imaterialize(TacticalAIHelpers.produceBlastShots(ship, battle));
            expect(result.length).toBe(0);

            let enemy2 = battle.fleets[1].addShip();
            enemy2.setArenaPosition(700, 0);

            result = imaterialize(TacticalAIHelpers.produceBlastShots(ship, battle));
            expect(result).toEqual([
                new Maneuver(ship, weapon.action, Target.newFromLocation(600, 0)),
                new Maneuver(ship, weapon.action, Target.newFromLocation(600, 0)),
            ]);

            let enemy3 = battle.fleets[1].addShip();
            enemy3.setArenaPosition(700, 300);

            result = imaterialize(TacticalAIHelpers.produceBlastShots(ship, battle));
            expect(result).toEqual([
                new Maneuver(ship, weapon.action, Target.newFromLocation(600, 0)),
                new Maneuver(ship, weapon.action, Target.newFromLocation(600, 0)),
            ]);
        });

        it("evaluates turn cost", function () {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            let weapon = TestTools.addWeapon(ship, 50, 5, 100);
            let engine = TestTools.addEngine(ship, 25);

            let maneuver = new Maneuver(ship, weapon.action, Target.newFromLocation(100, 0));
            expect(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver)).toBe(-Infinity);

            TestTools.setShipAP(ship, 10);
            expect(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver)).toBe(0.5);  // 5 power remaining on 10

            maneuver = new Maneuver(ship, weapon.action, Target.newFromLocation(110, 0));
            expect(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver)).toBe(0.4);  // 4 power remaining on 10

            maneuver = new Maneuver(ship, weapon.action, Target.newFromLocation(140, 0));
            expect(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver)).toBe(0.3);  // 3 power remaining on 10

            maneuver = new Maneuver(ship, weapon.action, Target.newFromLocation(310, 0));
            expect(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver)).toBe(-1);  // can't do in one turn
        });

        it("evaluates the drawback of doing nothing", function () {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            TestTools.setShipAP(ship, 10, 5);
            let engine = TestTools.addEngine(ship, 50);
            let weapon = TestTools.addWeapon(ship, 10, 2, 100, 10);

            let maneuver = new Maneuver(ship, weapon.action, Target.newFromLocation(0, 0));
            expect(TacticalAIHelpers.evaluateIdling(ship, battle, maneuver)).toEqual(-0.3);

            maneuver = new Maneuver(ship, engine.action, Target.newFromLocation(0, 0));
            expect(TacticalAIHelpers.evaluateIdling(ship, battle, maneuver)).toEqual(-0.5);

            ship.setValue("power", 2);

            maneuver = new Maneuver(ship, weapon.action, Target.newFromLocation(0, 0));
            expect(TacticalAIHelpers.evaluateIdling(ship, battle, maneuver)).toEqual(0.5);

            maneuver = new Maneuver(ship, engine.action, Target.newFromLocation(0, 0));
            expect(TacticalAIHelpers.evaluateIdling(ship, battle, maneuver)).toEqual(0);
        });

        it("evaluates damage to enemies", function () {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            let weapon = TestTools.addWeapon(ship, 50, 5, 500, 100);

            let enemy1 = battle.fleets[1].addShip();
            enemy1.setArenaPosition(250, 0);
            TestTools.setShipHP(enemy1, 50, 25);
            let enemy2 = battle.fleets[1].addShip();
            enemy2.setArenaPosition(300, 0);
            TestTools.setShipHP(enemy2, 25, 0);

            // no enemies hurt
            let maneuver = new Maneuver(ship, weapon.action, Target.newFromLocation(100, 0));
            expect(TacticalAIHelpers.evaluateDamageToEnemy(ship, battle, maneuver)).toEqual(0);

            // one enemy loses half-life
            maneuver = new Maneuver(ship, weapon.action, Target.newFromLocation(180, 0));
            expect(TacticalAIHelpers.evaluateDamageToEnemy(ship, battle, maneuver)).toEqual(0.25);

            // one enemy loses half-life, the other one is dead
            maneuver = new Maneuver(ship, weapon.action, Target.newFromLocation(280, 0));
            expect(TacticalAIHelpers.evaluateDamageToEnemy(ship, battle, maneuver)).toEqual(0.625);
        });

        it("evaluates ship clustering", function () {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            TestTools.addEngine(ship, 100);
            TestTools.setShipAP(ship, 10);
            let weapon = TestTools.addWeapon(ship, 100, 1, 100, 10);

            let maneuver = new Maneuver(ship, weapon.action, Target.newFromLocation(200, 0), 0.5);
            expect(maneuver.simulation.move_location).toEqual(Target.newFromLocation(100.5, 0));
            expect(TacticalAIHelpers.evaluateClustering(ship, battle, maneuver)).toEqual(0);

            battle.fleets[1].addShip().setArenaPosition(battle.width, battle.height);
            expect(TacticalAIHelpers.evaluateClustering(ship, battle, maneuver)).toBeCloseTo(-0.01, 2);

            battle.fleets[1].addShip().setArenaPosition(120, 40);
            expect(TacticalAIHelpers.evaluateClustering(ship, battle, maneuver)).toBeCloseTo(-0.4, 1);

            battle.fleets[0].addShip().setArenaPosition(80, 60);
            expect(TacticalAIHelpers.evaluateClustering(ship, battle, maneuver)).toBeCloseTo(-0.7, 1);

            battle.fleets[0].addShip().setArenaPosition(110, 20);
            expect(TacticalAIHelpers.evaluateClustering(ship, battle, maneuver)).toEqual(-1);
        });

        it("evaluates ship position", function () {
            let battle = new Battle(undefined, undefined, 200, 100);
            let ship = battle.fleets[0].addShip();
            let weapon = TestTools.addWeapon(ship, 1, 1, 400);

            ship.setArenaPosition(0, 0);
            let maneuver = new Maneuver(ship, weapon.action, new Target(0, 0), 0);
            expect(TacticalAIHelpers.evaluatePosition(ship, battle, maneuver)).toEqual(-1);

            ship.setArenaPosition(100, 0);
            maneuver = new Maneuver(ship, weapon.action, new Target(0, 0), 0);
            expect(TacticalAIHelpers.evaluatePosition(ship, battle, maneuver)).toEqual(-1);

            ship.setArenaPosition(100, 10);
            maneuver = new Maneuver(ship, weapon.action, new Target(0, 0), 0);
            expect(TacticalAIHelpers.evaluatePosition(ship, battle, maneuver)).toEqual(-0.6);

            ship.setArenaPosition(100, 50);
            maneuver = new Maneuver(ship, weapon.action, new Target(0, 0), 0);
            expect(TacticalAIHelpers.evaluatePosition(ship, battle, maneuver)).toEqual(1);
        });
    });
}
