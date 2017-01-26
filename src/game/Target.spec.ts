module TS.SpaceTac.Game.Specs {
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

        it("pushes a target out of a given circle", () => {
            var target = Target.newFromLocation(5, 5);
            expect(target.moveOutOfCircle(0, 0, 3, 0, 0)).toBe(target);
            expect(target.moveOutOfCircle(6, 6, 3, 0, 0)).toEqual(Target.newFromLocation(3.8786796564403576, 3.8786796564403576));
            expect(target.moveOutOfCircle(4, 4, 3, 10, 10)).toEqual(Target.newFromLocation(6.121320343559642, 6.121320343559642));
            expect(target.moveOutOfCircle(5, 8, 6, 5, 0)).toEqual(Target.newFromLocation(5, 2));
            expect(target.moveOutOfCircle(5, 2, 6, 5, 10)).toEqual(Target.newFromLocation(5, 8));
            expect(target.moveOutOfCircle(8, 5, 6, 0, 5)).toEqual(Target.newFromLocation(2, 5));
            expect(target.moveOutOfCircle(2, 5, 6, 10, 5)).toEqual(Target.newFromLocation(8, 5));
        });
    });
}
