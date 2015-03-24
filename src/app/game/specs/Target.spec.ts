/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game.Specs {
    "use strict";

    describe("Target", () => {
        it("initializes from ship or location", () => {
            var target: Target;

            target = Target.newFromLocation(2, 3);
            expect(target.x).toEqual(2);
            expect(target.y).toEqual(3);
            expect(target.ship).toBeNull();

            var ship = new Ship();
            ship.arena_x = 4;
            ship.arena_y = -2.1;
            target = Target.newFromShip(ship);
            expect(target.x).toEqual(4);
            expect(target.y).toEqual(-2.1);
            expect(target.ship).toBe(ship);
        });

        it("gets distance to another target", () => {
            var t1 = Target.newFromLocation(5, 1);
            var t2 = Target.newFromLocation(6, 2);
            expect(t1.getDistanceTo(t2)).toBeCloseTo(Math.sqrt(2), 0.00001);
        });

        it("checks if a target is in range of another", () => {
            var t1 = Target.newFromLocation(5, 4);
            expect(t1.isInRange(7, 3, 2)).toBe(false);
            expect(t1.isInRange(7, 3, 3)).toBe(true);
            expect(t1.isInRange(5, 5, 2)).toBe(true);
        });

        it("constraints a target to a limited range", () => {
            var target = Target.newFromLocation(5, 9);
            expect(target.constraintInRange(1, 1, Math.sqrt(80) * 0.5)).toEqual(Target.newFromLocation(3, 5));
            expect(target.constraintInRange(1, 1, 70)).toBe(target);
        });
    });
}
