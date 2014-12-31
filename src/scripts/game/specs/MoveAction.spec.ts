module SpaceTac.Game.Specs {
    describe("MoveAction", function () {
        it("checks movement against remaining AP", function(){
            var ship = new Ship(null, "Test");
            ship.ap_current = 6;
            ship.movement_cost = 2;
            ship.arena_x = 0;
            ship.arena_y = 0;
            var action = new Actions.MoveAction();

            var result = action.checkTarget(null, ship, Target.newFromLocation(0, 2));
            expect(result).toEqual(Target.newFromLocation(0, 2));

            var result = action.checkTarget(null, ship, Target.newFromLocation(0, 8));
            expect(result).toEqual(Target.newFromLocation(0, 3));

            ship.ap_current = 0;
            var result = action.checkTarget(null, ship, Target.newFromLocation(0, 8));
            expect(result).toBeNull();
        });

        it("forbids targetting a ship", function(){
            var ship1 = new Ship(null, "Test1");
            var ship2 = new Ship(null, "Test2");
            var action = new Actions.MoveAction();

            var result = action.checkTarget(null, ship1, Target.newFromShip(ship1));
            expect(result).toBeNull();

            var result = action.checkTarget(null, ship1, Target.newFromShip(ship2));
            expect(result).toBeNull();
        });
    });
}