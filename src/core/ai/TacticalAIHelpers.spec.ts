module TK.SpaceTac.Specs {
    testing("TacticalAIHelpers", test => {
        test.case("produces direct weapon shots", check => {
            let battle = new Battle();
            let ship0a = battle.fleets[0].addShip(new Ship(null, "0A"));
            let ship0b = battle.fleets[0].addShip(new Ship(null, "0B"));
            let ship1a = battle.fleets[1].addShip(new Ship(null, "1A"));
            let ship1b = battle.fleets[1].addShip(new Ship(null, "1B"));

            TestTools.setShipModel(ship0a, 100, 0, 10);
            TestTools.setShipPlaying(battle, ship0a);

            let result = imaterialize(TacticalAIHelpers.produceDirectShots(ship0a, battle));
            check.equals(result.length, 0);

            let weapon1 = TestTools.addWeapon(ship0a, 10);
            let weapon2 = TestTools.addWeapon(ship0a, 15);
            result = imaterialize(TacticalAIHelpers.produceDirectShots(ship0a, battle));
            check.equals(result.length, 4);
            check.contains(result, new Maneuver(ship0a, weapon1, Target.newFromShip(ship1a)));
            check.contains(result, new Maneuver(ship0a, weapon1, Target.newFromShip(ship1b)));
            check.contains(result, new Maneuver(ship0a, weapon2, Target.newFromShip(ship1a)));
            check.contains(result, new Maneuver(ship0a, weapon2, Target.newFromShip(ship1b)));
        });

        test.case("produces random moves inside a grid", check => {
            let battle = new Battle();
            battle.width = 100;
            battle.height = 100;
            let ship = battle.fleets[0].addShip();

            TestTools.setShipModel(ship, 100, 0, 10);
            TestTools.setShipPlaying(battle, ship);

            let result = imaterialize(TacticalAIHelpers.produceRandomMoves(ship, battle, 2, 1));
            check.equals(result.length, 0);

            let engine = TestTools.addEngine(ship, 1000);

            result = imaterialize(TacticalAIHelpers.produceRandomMoves(ship, battle, 2, 1, new SkewedRandomGenerator([0.5], true)));
            check.equals(result, [
                new Maneuver(ship, engine, Target.newFromLocation(25, 25)),
                new Maneuver(ship, engine, Target.newFromLocation(75, 25)),
                new Maneuver(ship, engine, Target.newFromLocation(25, 75)),
                new Maneuver(ship, engine, Target.newFromLocation(75, 75)),
            ]);
        });

        test.case("produces interesting blast shots", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            let weapon = TestTools.addWeapon(ship, 50, 1, 1000, 105);

            TestTools.setShipModel(ship, 100, 0, 10);
            TestTools.setShipPlaying(battle, ship);
            ship.actions.addCustom(weapon);

            let result = imaterialize(TacticalAIHelpers.produceInterestingBlastShots(ship, battle));
            check.equals(result.length, 0);

            let enemy1 = battle.fleets[1].addShip();
            enemy1.setArenaPosition(500, 0);

            result = imaterialize(TacticalAIHelpers.produceInterestingBlastShots(ship, battle));
            check.equals(result.length, 0);

            let enemy2 = battle.fleets[1].addShip();
            enemy2.setArenaPosition(700, 0);

            result = imaterialize(TacticalAIHelpers.produceInterestingBlastShots(ship, battle));
            check.equals(result, [
                new Maneuver(ship, weapon, Target.newFromLocation(600, 0)),
                new Maneuver(ship, weapon, Target.newFromLocation(600, 0)),
            ]);

            let enemy3 = battle.fleets[1].addShip();
            enemy3.setArenaPosition(700, 300);

            result = imaterialize(TacticalAIHelpers.produceInterestingBlastShots(ship, battle));
            check.equals(result, [
                new Maneuver(ship, weapon, Target.newFromLocation(600, 0)),
                new Maneuver(ship, weapon, Target.newFromLocation(600, 0)),
            ]);
        });

        test.case("evaluates turn cost", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            let weapon = TestTools.addWeapon(ship, 50, 5, 100);
            let action = weapon;
            let engine = TestTools.addEngine(ship, 25);

            let maneuver = new Maneuver(ship, new BaseAction("fake"), new Target(0, 0), 0);
            check.same(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver), -1);

            maneuver = new Maneuver(ship, action, Target.newFromLocation(100, 0), 0);
            check.same(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver), -Infinity);

            TestTools.setShipModel(ship, 100, 0, 4, 1, [engine, action]);
            maneuver = new Maneuver(ship, action, Target.newFromLocation(100, 0), 0);
            check.same(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver), -Infinity);

            TestTools.setShipModel(ship, 100, 0, 10, 1, [engine, action]);
            maneuver = new Maneuver(ship, action, Target.newFromLocation(100, 0), 0);
            check.equals(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver), 0.5);  // 5 power remaining on 10

            maneuver = new Maneuver(ship, action, Target.newFromLocation(110, 0), 0);
            check.equals(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver), 0.4);  // 4 power remaining on 10

            maneuver = new Maneuver(ship, action, Target.newFromLocation(140, 0), 0);
            check.equals(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver), 0.3);  // 3 power remaining on 10

            maneuver = new Maneuver(ship, action, Target.newFromLocation(310, 0), 0);
            check.same(TacticalAIHelpers.evaluateTurnCost(ship, battle, maneuver), -1);  // can't do in one turn
        });

        test.case("evaluates the drawback of doing nothing", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            TestTools.setShipModel(ship, 100, 0, 10);
            let engine = TestTools.addEngine(ship, 50);
            let weapon = TestTools.addWeapon(ship, 10, 2, 100, 10);
            let toggle = ship.actions.addCustom(new ToggleAction("test"));

            let maneuver = new Maneuver(ship, weapon, Target.newFromLocation(0, 0));
            check.equals(TacticalAIHelpers.evaluateIdling(ship, battle, maneuver), 0.5, "fire");

            maneuver = new Maneuver(ship, toggle, Target.newFromShip(ship));
            check.equals(TacticalAIHelpers.evaluateIdling(ship, battle, maneuver), 0.5, "toggle on");

            ship.actions.toggle(toggle, true);
            maneuver = new Maneuver(ship, toggle, Target.newFromShip(ship));
            check.equals(TacticalAIHelpers.evaluateIdling(ship, battle, maneuver), -0.2, "toggle off");

            maneuver = new Maneuver(ship, engine, Target.newFromLocation(0, 48));
            check.equals(TacticalAIHelpers.evaluateIdling(ship, battle, maneuver), -0.9, "move only, at full power");

            maneuver = new Maneuver(ship, EndTurnAction.SINGLETON, Target.newFromShip(ship));
            check.equals(TacticalAIHelpers.evaluateIdling(ship, battle, maneuver), -1, "end turn, at full power");

            ship.setValue("power", 2);

            maneuver = new Maneuver(ship, engine, Target.newFromLocation(0, 48));
            check.equals(TacticalAIHelpers.evaluateIdling(ship, battle, maneuver), -0.1, "move only, at reduced power");

            maneuver = new Maneuver(ship, EndTurnAction.SINGLETON, Target.newFromShip(ship));
            check.equals(TacticalAIHelpers.evaluateIdling(ship, battle, maneuver), -0.2, "end turn, at reduced power");
        });

        test.case("evaluates damage to enemies", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            let action = TestTools.addWeapon(ship, 50, 5, 500, 100);

            let enemy1 = battle.fleets[1].addShip();
            enemy1.setArenaPosition(250, 0);
            TestTools.setShipModel(enemy1, 50, 25);
            let enemy2 = battle.fleets[1].addShip();
            enemy2.setArenaPosition(300, 0);
            TestTools.setShipModel(enemy2, 25, 0);

            // no enemies hurt
            let maneuver = new Maneuver(ship, action, Target.newFromLocation(100, 0));
            check.nears(TacticalAIHelpers.evaluateEnemyHealth(ship, battle, maneuver), 0, 8);

            // one enemy loses half-life
            maneuver = new Maneuver(ship, action, Target.newFromLocation(180, 0));
            check.nears(TacticalAIHelpers.evaluateEnemyHealth(ship, battle, maneuver), 0.1666666666, 8);

            // one enemy loses half-life, the other one is dead
            maneuver = new Maneuver(ship, action, Target.newFromLocation(280, 0));
            check.nears(TacticalAIHelpers.evaluateEnemyHealth(ship, battle, maneuver), 0.6666666666, 8);
        });

        test.case("evaluates ship clustering", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            TestTools.setShipModel(ship, 100, 0, 10);
            TestTools.addEngine(ship, 100);
            let weapon = TestTools.addWeapon(ship, 100, 1, 100, 10);

            let maneuver = new Maneuver(ship, weapon, Target.newFromLocation(200, 0), 0.5);
            check.nears(maneuver.simulation.move_location.x, 100.5, 1);
            check.equals(maneuver.simulation.move_location.y, 0);
            check.equals(TacticalAIHelpers.evaluateClustering(ship, battle, maneuver), 0);

            battle.fleets[1].addShip().setArenaPosition(battle.width, battle.height);
            check.nears(TacticalAIHelpers.evaluateClustering(ship, battle, maneuver), -0.01, 2);

            battle.fleets[1].addShip().setArenaPosition(120, 40);
            check.nears(TacticalAIHelpers.evaluateClustering(ship, battle, maneuver), -0.4, 1);

            battle.fleets[0].addShip().setArenaPosition(80, 60);
            check.nears(TacticalAIHelpers.evaluateClustering(ship, battle, maneuver), -0.7, 1);

            battle.fleets[0].addShip().setArenaPosition(110, 20);
            check.equals(TacticalAIHelpers.evaluateClustering(ship, battle, maneuver), -1);
        });

        test.case("evaluates ship position", check => {
            let battle = new Battle(undefined, undefined, 200, 100);
            let ship = battle.fleets[0].addShip();
            let weapon = TestTools.addWeapon(ship, 1, 1, 400);
            let action = weapon;

            ship.setArenaPosition(0, 0);
            let maneuver = new Maneuver(ship, action, new Target(0, 0), 0);
            check.equals(TacticalAIHelpers.evaluatePosition(ship, battle, maneuver), -1);

            ship.setArenaPosition(100, 0);
            maneuver = new Maneuver(ship, action, new Target(0, 0), 0);
            check.equals(TacticalAIHelpers.evaluatePosition(ship, battle, maneuver), -1);

            ship.setArenaPosition(100, 10);
            maneuver = new Maneuver(ship, action, new Target(0, 0), 0);
            check.equals(TacticalAIHelpers.evaluatePosition(ship, battle, maneuver), -0.6);

            ship.setArenaPosition(100, 50);
            maneuver = new Maneuver(ship, action, new Target(0, 0), 0);
            check.equals(TacticalAIHelpers.evaluatePosition(ship, battle, maneuver), 1);
        });

        test.case("evaluates overheat", check => {
            let battle = new Battle(undefined, undefined, 200, 100);
            let ship = battle.fleets[0].addShip();
            let weapon = TestTools.addWeapon(ship, 1, 1, 400);

            let maneuver = new Maneuver(ship, weapon, new Target(0, 0));
            check.equals(TacticalAIHelpers.evaluateOverheat(ship, battle, maneuver), 0);

            weapon.configureCooldown(1, 1);
            ship.actions.updateFromShip(ship);
            ship.actions.addCustom(weapon);
            check.equals(TacticalAIHelpers.evaluateOverheat(ship, battle, maneuver), -0.4);

            weapon.configureCooldown(1, 2);
            ship.actions.updateFromShip(ship);
            ship.actions.addCustom(weapon);
            check.equals(TacticalAIHelpers.evaluateOverheat(ship, battle, maneuver), -0.8);

            weapon.configureCooldown(1, 3);
            ship.actions.updateFromShip(ship);
            ship.actions.addCustom(weapon);
            check.equals(TacticalAIHelpers.evaluateOverheat(ship, battle, maneuver), -1);

            weapon.configureCooldown(2, 1);
            ship.actions.updateFromShip(ship);
            ship.actions.addCustom(weapon);
            check.equals(TacticalAIHelpers.evaluateOverheat(ship, battle, maneuver), 0);
        });
    });
}
