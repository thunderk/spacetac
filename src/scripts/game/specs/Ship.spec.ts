/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game {
    describe("Ship", function(){
        it("limits movement range by action points", function(){
            var ship = new Ship(null, "Test");
            ship.ap_current = 8;
            ship.movement_cost = 3;
            ship.setArenaPosition(50, 50);

            var point = ship.getLongestMove(51, 52);
            expect(point).toEqual([51, 52]);

            var point = ship.getLongestMove(60, 55);
            expect(point[0]).toBeCloseTo(52.385139, 0.0001);
            expect(point[1]).toBeCloseTo(51.19256, 0.0001);
        });

        it("moves and consumes action points", function(){
            var ship = new Ship(null, "Test");
            ship.ap_current = 8;
            ship.movement_cost = 3;
            ship.setArenaPosition(50, 50);

            ship.moveTo(51, 50);
            expect(ship.ap_current).toEqual(5);
            expect(ship.arena_x).toEqual(51);
            expect(ship.arena_y).toEqual(50);

            ship.moveTo(53, 50);
            expect(ship.ap_current).toBe(0);
            expect(ship.arena_x).toBeCloseTo(52.333333, 0.00001);
            expect(ship.arena_y).toEqual(50);
        });
    });
}