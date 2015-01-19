/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game {
    "use strict";

    describe("MoveAction", function () {
        it("checks movement against remaining AP", function () {
            var ship = new Ship(null, "Test");
            ship.ap_current.setMaximal(20);
            ship.ap_current.set(6);
            ship.movement_cost = 2;
            ship.arena_x = 0;
            ship.arena_y = 0;
            var action = new MoveAction();

            var result = action.checkTarget(null, ship, Target.newFromLocation(0, 2));
            expect(result).toEqual(Target.newFromLocation(0, 2));

            result = action.checkTarget(null, ship, Target.newFromLocation(0, 8));
            expect(result).toEqual(Target.newFromLocation(0, 3));

            ship.ap_current.set(0);
            result = action.checkTarget(null, ship, Target.newFromLocation(0, 8));
            expect(result).toBeNull();
        });

        it("forbids targetting a ship", function () {
            var ship1 = new Ship(null, "Test1");
            var ship2 = new Ship(null, "Test2");
            var action = new MoveAction();

            var result = action.checkTarget(null, ship1, Target.newFromShip(ship1));
            expect(result).toBeNull();

            result = action.checkTarget(null, ship1, Target.newFromShip(ship2));
            expect(result).toBeNull();
        });

        it("applies to ship location, battle log and AP", function () {
            var battle = new Battle(null, null);
            var ship = new Ship(null, "Test");
            ship.ap_current.setMaximal(20);
            ship.ap_current.set(5);
            ship.movement_cost = 1;
            ship.arena_x = 0;
            ship.arena_y = 0;
            var action = new MoveAction();

            var result = action.apply(battle, ship, Target.newFromLocation(10, 10));
            expect(result).toBe(true);
            expect(ship.arena_x).toBeCloseTo(3.535533, 0.00001);
            expect(ship.arena_y).toBeCloseTo(3.535533, 0.00001);
            expect(ship.ap_current.current).toEqual(0);

            result = action.apply(battle, ship, Target.newFromLocation(10, 10));
            expect(result).toBe(false);
            expect(ship.arena_x).toBeCloseTo(3.535533, 0.00001);
            expect(ship.arena_y).toBeCloseTo(3.535533, 0.00001);
            expect(ship.ap_current.current).toEqual(0);

            expect(battle.log.events.length).toBe(1);
            expect(battle.log.events[0].code).toEqual("move");
            expect(battle.log.events[0].ship).toBe(ship);
            expect(battle.log.events[0].target.ship).toBeNull();
            expect(battle.log.events[0].target.x).toBeCloseTo(3.535533, 0.00001);
            expect(battle.log.events[0].target.y).toBeCloseTo(3.535533, 0.00001);
        });
    });
}
