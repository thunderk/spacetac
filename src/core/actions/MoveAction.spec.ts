module TK.SpaceTac {
    describe("MoveAction", function () {
        it("checks movement against remaining AP", function () {
            var ship = new Ship();
            var battle = new Battle(ship.fleet);
            TestTools.setShipPlaying(battle, ship);
            ship.values.power.setMaximal(20);
            ship.values.power.set(6);
            ship.arena_x = 0;
            ship.arena_y = 0;
            var engine = new Equipment();
            var action = new MoveAction(engine, 10);

            expect(action.getDistanceByActionPoint(ship)).toBe(10);

            var result = action.checkTarget(ship, Target.newFromLocation(0, 20));
            expect(result).toEqual(Target.newFromLocation(0, 20));

            result = action.checkTarget(ship, Target.newFromLocation(0, 80));
            expect(nn(result).y).toBeCloseTo(59.9, 0.000001);

            ship.values.power.set(0);
            result = action.checkTarget(ship, Target.newFromLocation(0, 80));
            expect(result).toBeNull();
        });

        it("forbids targetting a ship", function () {
            var ship1 = new Ship(null, "Test1");
            var ship2 = new Ship(null, "Test2");
            var action = new MoveAction(new Equipment());

            var result = action.checkTarget(ship1, Target.newFromShip(ship1));
            expect(result).toBeNull();

            result = action.checkTarget(ship1, Target.newFromShip(ship2));
            expect(result).toBeNull();
        });

        it("applies to ship location, battle log and AP", function () {
            var ship = new Ship();
            var battle = new Battle(ship.fleet);
            ship.values.power.setMaximal(20);
            ship.values.power.set(5);
            ship.arena_x = 0;
            ship.arena_y = 0;
            var engine = new Equipment();
            var action = new MoveAction(engine, 1);
            TestTools.setShipPlaying(battle, ship);

            spyOn(console, "warn").and.stub();

            var result = action.apply(ship, Target.newFromLocation(10, 10));
            expect(result).toBe(true);
            expect(ship.arena_x).toBeCloseTo(3.535533, 0.00001);
            expect(ship.arena_y).toBeCloseTo(3.535533, 0.00001);
            expect(ship.values.power.get()).toEqual(0);

            result = action.apply(ship, Target.newFromLocation(10, 10));
            expect(result).toBe(false);
            expect(ship.arena_x).toBeCloseTo(3.535533, 0.00001);
            expect(ship.arena_y).toBeCloseTo(3.535533, 0.00001);
            expect(ship.values.power.get()).toEqual(0);

            expect(battle.log.events.length).toBe(3);

            expect(battle.log.events[0].code).toEqual("value");
            expect(battle.log.events[0].ship).toBe(ship);
            expect((<ValueChangeEvent>battle.log.events[0]).value).toEqual(
                new ShipValue("power", 0, 20));

            expect(battle.log.events[1].code).toEqual("action");
            expect(battle.log.events[1].ship).toBe(ship);

            expect(battle.log.events[2].code).toEqual("move");
            expect(battle.log.events[2].ship).toBe(ship);
            let dest = (<MoveEvent>battle.log.events[2]).end;
            expect(dest.x).toBeCloseTo(3.535533, 0.00001);
            expect(dest.y).toBeCloseTo(3.535533, 0.00001);
        });

        it("can't move too much near another ship", function () {
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
            expect(result).toEqual(Target.newFromLocation(700, 500));

            result = action.checkLocationTarget(ship, Target.newFromLocation(800, 500));
            expect(result).toEqual(Target.newFromLocation(800, 500));

            result = action.checkLocationTarget(ship, Target.newFromLocation(900, 500));
            expect(result).toEqual(Target.newFromLocation(800, 500));

            result = action.checkLocationTarget(ship, Target.newFromLocation(1000, 500));
            expect(result).toEqual(Target.newFromLocation(800, 500));

            result = action.checkLocationTarget(ship, Target.newFromLocation(1200, 500));
            expect(result).toEqual(Target.newFromLocation(1200, 500));
        });

        it("exclusion radius is applied correctly over two ships", function () {
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
            expect(result).toEqual(Target.newFromLocation(0, 650));
        });

        it("exclusion radius does not make the ship go back", function () {
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
            expect(result).toBeNull();
            result = action.checkLocationTarget(ship, Target.newFromLocation(0, 1400));
            expect(result).toEqual(Target.newFromLocation(0, 1400));
        });

        it("applies ship maneuvrability to determine distance per power point", function () {
            let ship = new Ship();

            let action = new MoveAction(new Equipment(), 100, undefined, 60);
            ship.setAttribute("maneuvrability", 0);
            expect(action.getDistanceByActionPoint(ship)).toBeCloseTo(40, 0.01);
            ship.setAttribute("maneuvrability", 1);
            expect(action.getDistanceByActionPoint(ship)).toBeCloseTo(60, 0.01);
            ship.setAttribute("maneuvrability", 2);
            expect(action.getDistanceByActionPoint(ship)).toBeCloseTo(70, 0.01);
            ship.setAttribute("maneuvrability", 10);
            expect(action.getDistanceByActionPoint(ship)).toBeCloseTo(90, 0.01);

            action = new MoveAction(new Equipment(), 100, undefined, 0);
            ship.setAttribute("maneuvrability", 0);
            expect(action.getDistanceByActionPoint(ship)).toBeCloseTo(100, 0.01);
            ship.setAttribute("maneuvrability", 10);
            expect(action.getDistanceByActionPoint(ship)).toBeCloseTo(100, 0.01);
        });

        it("builds a textual description", function () {
            let action = new MoveAction(new Equipment(), 58, 0, 0);
            expect(action.getEffectsDescription()).toEqual("Move: 58km per power point");

            action = new MoveAction(new Equipment(), 58, 12, 0);
            expect(action.getEffectsDescription()).toEqual("Move: 58km per power point (safety: 12km)");

            action = new MoveAction(new Equipment(), 58, 12, 80);
            expect(action.getEffectsDescription()).toEqual("Move: 12-58km per power point (safety: 12km)");
        });
    });
}
