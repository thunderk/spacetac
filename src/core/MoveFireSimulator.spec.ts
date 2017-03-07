module TS.SpaceTac.Specs {
    describe("MoveFireSimulator", function () {

        function simpleWeaponCase(distance = 10, ship_ap = 5, weapon_ap = 3, engine_distance = 5): [Ship, MoveFireSimulator, BaseAction] {
            let ship = new Ship();
            TestTools.setShipAP(ship, ship_ap);
            TestTools.addEngine(ship, engine_distance);
            let action = new FireWeaponAction(new Equipment(), true);
            action.equipment.distance = distance;
            action.equipment.ap_usage = weapon_ap;
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
            expect(simulator.findBestEngine()).toBe(engine3);
            expect(simulator.findBestEngine().distance).toBe(150);
        });

        it("fires directly when in range", function () {
            let [ship, simulator, action] = simpleWeaponCase();
            let result = simulator.simulateAction(action, new Target(ship.arena_x + 5, ship.arena_y, null));

            expect(result.success).toBe(true, 'success');
            expect(result.need_move).toBe(false, 'need_move');
            expect(result.need_fire).toBe(true, 'need_fire');
            expect(result.can_fire).toBe(true, 'can_fire');
            expect(result.total_fire_ap).toBe(3, 'total_fire_ap');

            expect(result.parts).toEqual([
                { action: jasmine.objectContaining({ code: "fire-null" }), target: new Target(ship.arena_x + 5, ship.arena_y, null), ap: 3, possible: true }
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

            expect(result.parts).toEqual([
                { action: jasmine.objectContaining({ code: "fire-null" }), target: new Target(ship.arena_x + 5, ship.arena_y, null), ap: 3, possible: false }
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

            expect(result.parts).toEqual([
                { action: jasmine.objectContaining({ code: "move" }), target: new Target(ship.arena_x + 5, ship.arena_y, null), ap: 1, possible: true },
                { action: jasmine.objectContaining({ code: "fire-null" }), target: new Target(ship.arena_x + 15, ship.arena_y, null), ap: 3, possible: true }
            ]);
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

            expect(result.parts).toEqual([
                { action: jasmine.objectContaining({ code: "move" }), target: new Target(ship.arena_x + 10, ship.arena_y, null), ap: 2, possible: true },
                { action: jasmine.objectContaining({ code: "fire-null" }), target: new Target(ship.arena_x + 18, ship.arena_y, null), ap: 2, possible: false }
            ]);
        });

        it("does nothing if trying to move in the same spot", function () {
            let [ship, simulator, action] = simpleWeaponCase();
            let result = simulator.simulateAction(ship.listEquipment(SlotType.Engine)[0].action, new Target(ship.arena_x, ship.arena_y, null));
            expect(result.success).toBe(true);
            expect(result.need_move).toBe(false);
            expect(result.need_fire).toBe(false);
            expect(result.parts).toEqual([]);
        });
    });
}
