module TK.SpaceTac.Specs {
    testing("Target", test => {
        test.case("initializes from ship or location", check => {
            var target: Target;

            target = Target.newFromLocation(2, 3);
            check.equals(target.x, 2);
            check.equals(target.y, 3);
            check.equals(target.ship_id, null);

            var ship = new Ship();
            ship.arena_x = 4;
            ship.arena_y = -2.1;
            target = Target.newFromShip(ship);
            check.equals(target.x, 4);
            check.equals(target.y, -2.1);
            check.equals(target.ship_id, ship.id);
        });

        test.case("gets distance to another target", check => {
            var t1 = Target.newFromLocation(5, 1);
            var t2 = Target.newFromLocation(6, 2);
            check.nears(t1.getDistanceTo(t2), Math.sqrt(2));
        });

        test.case("gets angle to another target", check => {
            var t1 = Target.newFromLocation(2, 3);
            var t2 = Target.newFromLocation(4, 5);
            check.nears(t1.getAngleTo(t2), Math.PI / 4);
        });

        test.case("checks if a target is in range of another", check => {
            var t1 = Target.newFromLocation(5, 4);
            check.equals(t1.isInRange(7, 3, 2), false);
            check.equals(t1.isInRange(7, 3, 3), true);
            check.equals(t1.isInRange(5, 5, 2), true);
        });

        test.case("constraints a target to a limited range", check => {
            var target = Target.newFromLocation(5, 9);
            check.equals(target.constraintInRange(1, 1, Math.sqrt(80) * 0.5), Target.newFromLocation(3, 5));
            check.same(target.constraintInRange(1, 1, 70), target);
        });

        test.case("pushes a target out of a given circle", check => {
            var target = Target.newFromLocation(5, 5);
            check.same(target.moveOutOfCircle(0, 0, 3, 0, 0), target);
            check.equals(target.moveOutOfCircle(6, 6, 3, 0, 0), Target.newFromLocation(3.8786796564403576, 3.8786796564403576));
            check.equals(target.moveOutOfCircle(4, 4, 3, 10, 10), Target.newFromLocation(6.121320343559642, 6.121320343559642));
            check.equals(target.moveOutOfCircle(5, 8, 6, 5, 0), Target.newFromLocation(5, 2));
            check.equals(target.moveOutOfCircle(5, 2, 6, 5, 10), Target.newFromLocation(5, 8));
            check.equals(target.moveOutOfCircle(8, 5, 6, 0, 5), Target.newFromLocation(2, 5));
            check.equals(target.moveOutOfCircle(2, 5, 6, 10, 5), Target.newFromLocation(8, 5));
        });

        test.case("keeps a target inside a rectangle", check => {
            var target = Target.newFromLocation(5, 5);
            check.same(target.keepInsideRectangle(0, 0, 10, 10, 0, 0), target);
            check.equals(target.keepInsideRectangle(8, 0, 13, 10, 10, 5), Target.newFromLocation(8, 5));
        });
    });
}
