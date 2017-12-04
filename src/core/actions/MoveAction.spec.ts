module TK.SpaceTac.Specs {
    testing("MoveAction", test => {
        test.case("checks movement against remaining AP", check => {
            var ship = new Ship();
            var battle = new Battle(ship.fleet);
            TestTools.setShipPlaying(battle, ship);
            ship.setValue("power", 6);
            ship.arena_x = 0;
            ship.arena_y = 0;
            var engine = new Equipment();
            var action = new MoveAction(engine, 10);

            check.equals(action.getDistanceByActionPoint(ship), 10);

            var result = action.checkTarget(ship, Target.newFromLocation(0, 20));
            check.equals(result, Target.newFromLocation(0, 20));

            result = action.checkTarget(ship, Target.newFromLocation(0, 80));
            check.nears(nn(result).y, 59.9);

            ship.setValue("power", 0);
            result = action.checkTarget(ship, Target.newFromLocation(0, 80));
            check.equals(result, null);
        });

        test.case("forbids targetting a ship", check => {
            var ship1 = new Ship(null, "Test1");
            var ship2 = new Ship(null, "Test2");
            var action = new MoveAction(new Equipment());

            var result = action.checkTarget(ship1, Target.newFromShip(ship1));
            check.equals(result, null);

            result = action.checkTarget(ship1, Target.newFromShip(ship2));
            check.equals(result, null);
        });

        test.case("applies and reverts", check => {
            let battle = TestTools.createBattle();
            let ship = battle.play_order[0];
            ship.setArenaPosition(500, 600)
            TestTools.setShipAP(ship, 20);
            ship.setValue("power", 5);

            let engine = new Equipment(SlotType.Engine);
            let action = new MoveAction(engine, 1);
            engine.action = action;
            ship.addSlot(SlotType.Engine).attach(engine);

            TestTools.actionChain(check, battle, [
                [ship, action, Target.newFromLocation(510, 605)],
            ], [
                    check => {
                        check.equals(ship.arena_x, 500, "ship X");
                        check.equals(ship.arena_y, 600, "ship Y");
                        check.equals(ship.getValue("power"), 5, "power");
                    },
                    check => {
                        check.nears(ship.arena_x, 504.382693, 5, "ship X");
                        check.nears(ship.arena_y, 602.191346, 5, "ship Y");
                        check.equals(ship.getValue("power"), 0, "power");
                    }
                ]);
        });

        test.case("can't move too much near another ship", check => {
            var battle = TestTools.createBattle(1, 1);
            var ship = battle.fleets[0].ships[0];
            var enemy = battle.fleets[1].ships[0];
            TestTools.setShipAP(ship, 100);
            ship.setArenaPosition(500, 500);
            enemy.setArenaPosition(1000, 500);

            var action = new MoveAction(new Equipment());
            action.distance_per_power = 1000;
            action.safety_distance = 200;

            var result = action.checkLocationTarget(ship, Target.newFromLocation(700, 500));
            check.equals(result, Target.newFromLocation(700, 500));

            result = action.checkLocationTarget(ship, Target.newFromLocation(800, 500));
            check.equals(result, Target.newFromLocation(800, 500));

            result = action.checkLocationTarget(ship, Target.newFromLocation(900, 500));
            check.equals(result, Target.newFromLocation(800, 500));

            result = action.checkLocationTarget(ship, Target.newFromLocation(1000, 500));
            check.equals(result, Target.newFromLocation(800, 500));

            result = action.checkLocationTarget(ship, Target.newFromLocation(1200, 500));
            check.equals(result, Target.newFromLocation(1200, 500));
        });

        test.case("exclusion radius is applied correctly over two ships", check => {
            var battle = TestTools.createBattle(1, 2);
            var ship = battle.fleets[0].ships[0];
            var enemy1 = battle.fleets[1].ships[0];
            var enemy2 = battle.fleets[1].ships[1];
            TestTools.setShipAP(ship, 100);
            enemy1.setArenaPosition(0, 800);
            enemy2.setArenaPosition(0, 1000);

            var action = new MoveAction(new Equipment());
            action.distance_per_power = 1000;
            action.safety_distance = 150;

            var result = action.checkLocationTarget(ship, Target.newFromLocation(0, 1100));
            check.equals(result, Target.newFromLocation(0, 650));
        });

        test.case("exclusion radius does not make the ship go back", check => {
            var battle = TestTools.createBattle(1, 2);
            var ship = battle.fleets[0].ships[0];
            var enemy1 = battle.fleets[1].ships[0];
            var enemy2 = battle.fleets[1].ships[1];
            TestTools.setShipAP(ship, 100);
            enemy1.setArenaPosition(0, 500);
            enemy2.setArenaPosition(0, 800);

            var action = new MoveAction(new Equipment());
            action.distance_per_power = 1000;
            action.safety_distance = 600;

            let result = action.checkLocationTarget(ship, Target.newFromLocation(0, 1000));
            check.equals(result, null);
            result = action.checkLocationTarget(ship, Target.newFromLocation(0, 1400));
            check.equals(result, Target.newFromLocation(0, 1400));
        });

        test.case("applies ship maneuvrability to determine distance per power point", check => {
            let ship = new Ship();

            let action = new MoveAction(new Equipment(), 100, undefined, 60);
            TestTools.setAttribute(ship, "maneuvrability", 0);
            check.nears(action.getDistanceByActionPoint(ship), 40);
            TestTools.setAttribute(ship, "maneuvrability", 1);
            check.nears(action.getDistanceByActionPoint(ship), 60);
            TestTools.setAttribute(ship, "maneuvrability", 2);
            check.nears(action.getDistanceByActionPoint(ship), 70);
            TestTools.setAttribute(ship, "maneuvrability", 10);
            check.nears(action.getDistanceByActionPoint(ship), 90);

            action = new MoveAction(new Equipment(), 100, undefined, 0);
            TestTools.setAttribute(ship, "maneuvrability", 0);
            check.nears(action.getDistanceByActionPoint(ship), 100);
            TestTools.setAttribute(ship, "maneuvrability", 10);
            check.nears(action.getDistanceByActionPoint(ship), 100);
        });

        test.case("builds a textual description", check => {
            let action = new MoveAction(new Equipment(), 58, 0, 0);
            check.equals(action.getEffectsDescription(), "Move: 58km per power point");

            action = new MoveAction(new Equipment(), 58, 12, 0);
            check.equals(action.getEffectsDescription(), "Move: 58km per power point (safety: 12km)");

            action = new MoveAction(new Equipment(), 58, 12, 80);
            check.equals(action.getEffectsDescription(), "Move: 12-58km per power point (safety: 12km)");
        });
    });
}
