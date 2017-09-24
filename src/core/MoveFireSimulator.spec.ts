module TK.SpaceTac.Specs {
    describe("MoveFireSimulator", function () {

        function simpleWeaponCase(distance = 10, ship_ap = 5, weapon_ap = 3, engine_distance = 5): [Ship, MoveFireSimulator, BaseAction] {
            let ship = new Ship();
            TestTools.setShipAP(ship, ship_ap);
            TestTools.addEngine(ship, engine_distance);
            let action = new FireWeaponAction(new Equipment(), weapon_ap, distance);
            let simulator = new MoveFireSimulator(ship);
            return [ship, simulator, action];
        }

        it("finds the best engine to make a move", function () {
            let ship = new Ship();
            let simulator = new MoveFireSimulator(ship);
            expect(simulator.findBestEngine()).toBe(null);
            let engine1 = TestTools.addEngine(ship, 100);
            expect(simulator.findBestEngine()).toBe(engine1);
            let engine2 = TestTools.addEngine(ship, 120);
            let engine3 = TestTools.addEngine(ship, 150);
            let engine4 = TestTools.addEngine(ship, 70);
            let best = simulator.findBestEngine();
            expect(best).toBe(engine3);
            expect((<MoveAction>nn(best).action).distance_per_power).toBe(150);
        });

        it("fires directly when in range", function () {
            let [ship, simulator, action] = simpleWeaponCase();
            let result = simulator.simulateAction(action, new Target(ship.arena_x + 5, ship.arena_y, null));

            expect(result.success).toBe(true, 'success');
            expect(result.need_move).toBe(false, 'need_move');
            expect(result.need_fire).toBe(true, 'need_fire');
            expect(result.can_fire).toBe(true, 'can_fire');
            expect(result.total_fire_ap).toBe(3, 'total_fire_ap');

            expect(<any[]>result.parts).toEqual([
                { action: jasmine.objectContaining({ code: "fire-equipment" }), target: new Target(ship.arena_x + 5, ship.arena_y, null), ap: 3, possible: true }
            ]);
        });

        it("can't fire when in range, but not enough AP", function () {
            let [ship, simulator, action] = simpleWeaponCase(10, 2, 3);
            let result = simulator.simulateAction(action, new Target(ship.arena_x + 5, ship.arena_y, null));
            expect(result.success).toBe(true, 'success');
            expect(result.need_move).toBe(false, 'need_move');
            expect(result.need_fire).toBe(true, 'need_fire');
            expect(result.can_fire).toBe(false, 'can_fire');
            expect(result.total_fire_ap).toBe(3, 'total_fire_ap');

            expect(<any[]>result.parts).toEqual([
                { action: jasmine.objectContaining({ code: "fire-equipment" }), target: new Target(ship.arena_x + 5, ship.arena_y, null), ap: 3, possible: false }
            ]);
        });

        it("moves straight to get within range", function () {
            let [ship, simulator, action] = simpleWeaponCase();
            let result = simulator.simulateAction(action, new Target(ship.arena_x + 15, ship.arena_y, null));
            expect(result.success).toBe(true, 'success');
            expect(result.need_move).toBe(true, 'need_move');
            expect(result.can_end_move).toBe(true, 'can_end_move');
            expect(result.move_location).toEqual(new Target(ship.arena_x + 5, ship.arena_y, null));
            expect(result.total_move_ap).toBe(1);
            expect(result.need_fire).toBe(true, 'need_fire');
            expect(result.can_fire).toBe(true, 'can_fire');
            expect(result.total_fire_ap).toBe(3, 'total_fire_ap');

            expect(<any[]>result.parts).toEqual([
                { action: jasmine.objectContaining({ code: "move" }), target: new Target(ship.arena_x + 5, ship.arena_y, null), ap: 1, possible: true },
                { action: jasmine.objectContaining({ code: "fire-equipment" }), target: new Target(ship.arena_x + 15, ship.arena_y, null), ap: 3, possible: true }
            ]);
        });

        it("scans a circle for move targets", function () {
            let simulator = new MoveFireSimulator(new Ship());

            let result = simulator.scanCircle(50, 30, 10, 1, 1);
            expect(imaterialize(result)).toEqual([
                new Target(50, 30)
            ]);

            result = simulator.scanCircle(50, 30, 10, 2, 1);
            expect(imaterialize(result)).toEqual([
                new Target(50, 30),
                new Target(60, 30)
            ]);

            result = simulator.scanCircle(50, 30, 10, 2, 2);
            expect(imaterialize(result)).toEqual([
                new Target(50, 30),
                new Target(60, 30),
                new Target(40, 30)
            ]);

            result = simulator.scanCircle(50, 30, 10, 3, 4);
            expect(imaterialize(result)).toEqual([
                new Target(50, 30),
                new Target(55, 30),
                new Target(45, 30),
                new Target(60, 30),
                new Target(50, 40),
                new Target(40, 30),
                new Target(50, 20)
            ]);
        });

        it("accounts for exclusion areas for the approach", function () {
            let [ship, simulator, action] = simpleWeaponCase(100, 5, 1, 50);
            ship.setArenaPosition(300, 200);
            let battle = new Battle();
            battle.fleets[0].addShip(ship);
            let ship1 = battle.fleets[0].addShip();
            let moveaction = <MoveAction>nn(simulator.findBestEngine()).action;
            moveaction.safety_distance = 30;
            battle.ship_separation = 30;

            expect(simulator.getApproach(moveaction, Target.newFromLocation(350, 200), 100)).toBe(ApproachSimulationError.NO_MOVE_NEEDED);
            expect(simulator.getApproach(moveaction, Target.newFromLocation(400, 200), 100)).toBe(ApproachSimulationError.NO_MOVE_NEEDED);
            expect(simulator.getApproach(moveaction, Target.newFromLocation(500, 200), 100)).toEqual(new Target(400, 200));

            ship1.setArenaPosition(420, 200);

            spyOn(simulator, "scanCircle").and.returnValue(iarray([
                new Target(400, 200),
                new Target(410, 200),
                new Target(410, 230),
                new Target(420, 210),
                new Target(480, 260),
            ]));
            expect(simulator.getApproach(moveaction, Target.newFromLocation(500, 200), 100)).toEqual(new Target(410, 230));
        });

        it("moves to get in range, even if not enough AP to fire", function () {
            let [ship, simulator, action] = simpleWeaponCase(8, 3, 2, 5);
            let result = simulator.simulateAction(action, new Target(ship.arena_x + 18, ship.arena_y, null));
            expect(result.success).toBe(true, 'success');
            expect(result.need_move).toBe(true, 'need_move');
            expect(result.can_end_move).toBe(true, 'can_end_move');
            expect(result.move_location).toEqual(new Target(ship.arena_x + 10, ship.arena_y, null));
            expect(result.total_move_ap).toBe(2);
            expect(result.need_fire).toBe(true, 'need_fire');
            expect(result.can_fire).toBe(false, 'can_fire');
            expect(result.total_fire_ap).toBe(2, 'total_fire_ap');

            expect(<any[]>result.parts).toEqual([
                { action: jasmine.objectContaining({ code: "move" }), target: new Target(ship.arena_x + 10, ship.arena_y, null), ap: 2, possible: true },
                { action: jasmine.objectContaining({ code: "fire-equipment" }), target: new Target(ship.arena_x + 18, ship.arena_y, null), ap: 2, possible: false }
            ]);
        });

        it("does nothing if trying to move in the same spot", function () {
            let [ship, simulator, action] = simpleWeaponCase();
            let move_action = nn(ship.listEquipment(SlotType.Engine)[0].action)
            let result = simulator.simulateAction(move_action, new Target(ship.arena_x, ship.arena_y, null));
            expect(result.success).toBe(false);
            expect(result.need_move).toBe(false);
            expect(result.need_fire).toBe(false);
            expect(result.parts).toEqual([]);
        });

        it("does not move if already in range, even if in the safety margin", function () {
            let [ship, simulator, action] = simpleWeaponCase(100);
            let result = simulator.simulateAction(action, new Target(ship.arena_x + 97, ship.arena_y, null), 5);
            expect(result.success).toBe(true);
            expect(result.need_move).toBe(false);
            result = simulator.simulateAction(action, new Target(ship.arena_x + 101, ship.arena_y, null), 5);
            expect(result.success).toBe(true);
            expect(result.need_move).toBe(true);
            expect(result.move_location).toEqual(new Target(ship.arena_x + 6, ship.arena_y));
        });
    });
}
