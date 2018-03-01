module TK.SpaceTac.Specs {
    testing("MoveFireSimulator", test => {

        function simpleWeaponCase(distance = 10, ship_ap = 5, weapon_ap = 3, engine_distance = 5): [Ship, MoveFireSimulator, BaseAction] {
            let ship = new Ship();
            TestTools.setShipModel(ship, 100, 0, ship_ap);
            TestTools.addEngine(ship, engine_distance);
            let action = new TriggerAction("weapon", { power: weapon_ap, range: distance });
            let simulator = new MoveFireSimulator(ship);
            return [ship, simulator, action];
        }

        test.case("finds a suitable engine to make an approach", check => {
            let ship = new Ship();
            let simulator = new MoveFireSimulator(ship);
            check.equals(simulator.findEngine(), null);
            let engine1 = TestTools.addEngine(ship, 100);
            check.same(simulator.findEngine(), engine1);
            let engine2 = TestTools.addEngine(ship, 120);
            check.same(simulator.findEngine(), engine1);
            engine1.configureCooldown(1, 1);
            engine1.getCooldown().use();
            check.same(simulator.findEngine(), engine2);
            engine2.configureCooldown(1, 1);
            engine2.getCooldown().use();
            check.equals(simulator.findEngine(), null);
        });

        test.case("fires directly when in range", check => {
            let [ship, simulator, action] = simpleWeaponCase();
            let result = simulator.simulateAction(action, new Target(ship.arena_x + 5, ship.arena_y, null));

            check.same(result.success, true, 'success');
            check.same(result.need_move, false, 'need_move');
            check.same(result.need_fire, true, 'need_fire');
            check.same(result.can_fire, true, 'can_fire');
            check.same(result.total_fire_ap, 3, 'total_fire_ap');

            check.equals(result.parts, [
                { action: action, target: new Target(ship.arena_x + 5, ship.arena_y, null), ap: 3, possible: true }
            ]);
        });

        test.case("can't fire when in range, but not enough AP", check => {
            let [ship, simulator, action] = simpleWeaponCase(10, 2, 3);
            let result = simulator.simulateAction(action, new Target(ship.arena_x + 5, ship.arena_y, null));
            check.same(result.success, true, 'success');
            check.same(result.need_move, false, 'need_move');
            check.same(result.need_fire, true, 'need_fire');
            check.same(result.can_fire, false, 'can_fire');
            check.same(result.total_fire_ap, 3, 'total_fire_ap');

            check.equals(result.parts, [
                { action: action, target: new Target(ship.arena_x + 5, ship.arena_y, null), ap: 3, possible: false }
            ]);
        });

        test.case("moves straight to get within range", check => {
            let [ship, simulator, action] = simpleWeaponCase();
            let result = simulator.simulateAction(action, new Target(ship.arena_x + 15, ship.arena_y, null));
            check.same(result.success, true, 'success');
            check.same(result.need_move, true, 'need_move');
            check.same(result.can_end_move, true, 'can_end_move');
            check.equals(result.move_location, new Target(ship.arena_x + 5, ship.arena_y, null));
            check.equals(result.total_move_ap, 1);
            check.same(result.need_fire, true, 'need_fire');
            check.same(result.can_fire, true, 'can_fire');
            check.same(result.total_fire_ap, 3, 'total_fire_ap');

            let move_action = ship.actions.listAll().filter(action => action instanceof MoveAction)[0];
            check.equals(result.parts, [
                { action: move_action, target: new Target(ship.arena_x + 5, ship.arena_y, null), ap: 1, possible: true },
                { action: action, target: new Target(ship.arena_x + 15, ship.arena_y, null), ap: 3, possible: true }
            ]);
        });

        test.case("scans a circle for move targets", check => {
            let simulator = new MoveFireSimulator(new Ship());

            let result = simulator.scanCircle(50, 30, 10, 1, 1);
            check.equals(imaterialize(result), [
                new Target(50, 30)
            ]);

            result = simulator.scanCircle(50, 30, 10, 2, 1);
            check.equals(imaterialize(result), [
                new Target(50, 30),
                new Target(60, 30)
            ]);

            result = simulator.scanCircle(50, 30, 10, 2, 2);
            check.equals(imaterialize(result), [
                new Target(50, 30),
                new Target(60, 30),
                new Target(40, 30)
            ]);

            result = simulator.scanCircle(50, 30, 10, 3, 4);
            check.equals(imaterialize(result), [
                new Target(50, 30),
                new Target(55, 30),
                new Target(45, 30),
                new Target(60, 30),
                new Target(50, 40),
                new Target(40, 30),
                new Target(50, 20)
            ]);
        });

        test.case("accounts for exclusion areas for the approach", check => {
            let [ship, simulator, action] = simpleWeaponCase(100, 5, 1, 50);
            ship.setArenaPosition(300, 200);
            let battle = new Battle();
            battle.fleets[0].addShip(ship);
            let ship1 = battle.fleets[0].addShip();
            let moveaction = nn(simulator.findEngine());
            (<any>moveaction).safety_distance = 30;
            battle.ship_separation = 30;

            check.same(simulator.getApproach(moveaction, Target.newFromLocation(350, 200), 100), ApproachSimulationError.NO_MOVE_NEEDED);
            check.same(simulator.getApproach(moveaction, Target.newFromLocation(400, 200), 100), ApproachSimulationError.NO_MOVE_NEEDED);
            check.equals(simulator.getApproach(moveaction, Target.newFromLocation(500, 200), 100), new Target(400, 200));

            ship1.setArenaPosition(420, 200);

            check.patch(simulator, "scanCircle", () => iarray([
                new Target(400, 200),
                new Target(410, 200),
                new Target(410, 230),
                new Target(420, 210),
                new Target(480, 260),
            ]));
            check.equals(simulator.getApproach(moveaction, Target.newFromLocation(500, 200), 100), new Target(410, 230));
        });

        test.case("moves to get in range, even if not enough AP to fire", check => {
            let [ship, simulator, action] = simpleWeaponCase(8, 3, 2, 5);
            let result = simulator.simulateAction(action, new Target(ship.arena_x + 18, ship.arena_y, null));
            check.same(result.success, true, 'success');
            check.same(result.need_move, true, 'need_move');
            check.same(result.can_end_move, true, 'can_end_move');
            check.equals(result.move_location, new Target(ship.arena_x + 10, ship.arena_y, null));
            check.equals(result.total_move_ap, 2);
            check.same(result.need_fire, true, 'need_fire');
            check.same(result.can_fire, false, 'can_fire');
            check.same(result.total_fire_ap, 2, 'total_fire_ap');

            let move_action = ship.actions.listAll().filter(action => action instanceof MoveAction)[0];
            check.equals(result.parts, [
                { action: move_action, target: new Target(ship.arena_x + 10, ship.arena_y, null), ap: 2, possible: true },
                { action: action, target: new Target(ship.arena_x + 18, ship.arena_y, null), ap: 2, possible: false }
            ]);
        });

        test.case("does nothing if trying to move in the same spot", check => {
            let [ship, simulator, action] = simpleWeaponCase();
            let move_action = ship.actions.listAll().filter(action => action instanceof MoveAction)[0];
            let result = simulator.simulateAction(move_action, new Target(ship.arena_x, ship.arena_y, null));
            check.equals(result.success, false);
            check.equals(result.need_move, false);
            check.equals(result.need_fire, false);
            check.equals(result.parts, []);
        });

        test.case("does not move if already in range, even if in the safety margin", check => {
            let [ship, simulator, action] = simpleWeaponCase(100);
            let result = simulator.simulateAction(action, new Target(ship.arena_x + 97, ship.arena_y, null), 5);
            check.equals(result.success, true);
            check.equals(result.need_move, false);
            result = simulator.simulateAction(action, new Target(ship.arena_x + 101, ship.arena_y, null), 5);
            check.equals(result.success, true);
            check.equals(result.need_move, true);
            check.equals(result.move_location, new Target(ship.arena_x + 6, ship.arena_y));
        });
    });
}
