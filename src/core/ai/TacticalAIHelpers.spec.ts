module TS.SpaceTac.Specs {
    describe("TacticalAIHelpers", function () {
        it("produces direct weapon shots", function () {
            let battle = new Battle();
            let ship0a = battle.fleets[0].addShip(new Ship(null, "0A"));
            let ship0b = battle.fleets[0].addShip(new Ship(null, "0B"));
            let ship1a = battle.fleets[1].addShip(new Ship(null, "1A"));
            let ship1b = battle.fleets[1].addShip(new Ship(null, "1B"));

            let result = imaterialize(TacticalAIHelpers.produceDirectShots(ship0a, battle));
            expect(result.length).toBe(0);

            let weapon1 = ship0a.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            let weapon2 = ship0a.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            result = imaterialize(TacticalAIHelpers.produceDirectShots(ship0a, battle));
            expect(result.length).toBe(4);
            expect(result).toContain(new Maneuver(ship0a, weapon1, Target.newFromShip(ship1a)));
            expect(result).toContain(new Maneuver(ship0a, weapon1, Target.newFromShip(ship1b)));
            expect(result).toContain(new Maneuver(ship0a, weapon2, Target.newFromShip(ship1a)));
            expect(result).toContain(new Maneuver(ship0a, weapon2, Target.newFromShip(ship1b)));
        });

        it("produces random moves inside a grid", function () {
            let battle = new Battle();
            battle.width = 100;
            battle.height = 100;
            let ship = battle.fleets[0].addShip();

            let result = imaterialize(TacticalAIHelpers.produceRandomMoves(ship, battle, 2, 1));
            expect(result.length).toBe(0);

            let engine = ship.addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine));

            result = imaterialize(TacticalAIHelpers.produceRandomMoves(ship, battle, 2, 1, new SkewedRandomGenerator([0.5], true)));
            expect(result).toEqual([
                new Maneuver(ship, engine, Target.newFromLocation(25, 25)),
                new Maneuver(ship, engine, Target.newFromLocation(75, 25)),
                new Maneuver(ship, engine, Target.newFromLocation(25, 75)),
                new Maneuver(ship, engine, Target.newFromLocation(75, 75)),
            ]);
        });

        it("produces blast shots", function () {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            let weapon = TestTools.addWeapon(ship, 50, 1, 1000, 105);

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
                new Maneuver(ship, weapon, Target.newFromLocation(600, 0)),
            ]);

            let enemy3 = battle.fleets[1].addShip();
            enemy3.setArenaPosition(700, 300);

            result = imaterialize(TacticalAIHelpers.produceBlastShots(ship, battle));
            expect(result).toEqual([
                new Maneuver(ship, weapon, Target.newFromLocation(600, 0)),
            ]);
        });

        it("evaluates turn cost", function () {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            let weapon = TestTools.addWeapon(ship, 50, 5, 100);
            let engine = TestTools.addEngine(ship, 25);

            let maneuver = new Maneuver(ship, weapon, Target.newFromLocation(100, 0));
            expect(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver)).toBe(-Infinity);

            TestTools.setShipAP(ship, 10);
            expect(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver)).toBe(0.5);  // 5 power remaining on 10

            maneuver = new Maneuver(ship, weapon, Target.newFromLocation(110, 0));
            expect(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver)).toBe(0.4);  // 4 power remaining on 10

            maneuver = new Maneuver(ship, weapon, Target.newFromLocation(140, 0));
            expect(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver)).toBe(0.3);  // 3 power remaining on 10

            maneuver = new Maneuver(ship, weapon, Target.newFromLocation(310, 0));
            expect(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver)).toBe(-1);  // can't do in one turn
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
            let maneuver = new Maneuver(ship, weapon, Target.newFromLocation(100, 0));
            expect(TacticalAIHelpers.evaluateDamageToEnemy(ship, battle, maneuver)).toEqual(0);

            // one enemy loses half-life
            maneuver = new Maneuver(ship, weapon, Target.newFromLocation(180, 0));
            expect(TacticalAIHelpers.evaluateDamageToEnemy(ship, battle, maneuver)).toEqual(0.25);

            // one enemy loses half-life, the other one is dead
            maneuver = new Maneuver(ship, weapon, Target.newFromLocation(280, 0));
            expect(TacticalAIHelpers.evaluateDamageToEnemy(ship, battle, maneuver)).toEqual(0.625);
        });

        it("evaluates ship clustering", function () {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            TestTools.addEngine(ship, 100);
            TestTools.setShipAP(ship, 10);
            let weapon = TestTools.addWeapon(ship, 100, 1, 100, 10);

            let maneuver = new Maneuver(ship, weapon, Target.newFromLocation(200, 0), 0.5);
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
    });
}
