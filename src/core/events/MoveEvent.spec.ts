module TK.SpaceTac.Specs {
    describe("MoveEvent", function () {
        it("get reverse event", function () {
            let ship = new Ship();
            let event = new MoveEvent(ship, new ArenaLocationAngle(0, 0, 0), new ArenaLocationAngle(5, 10, 1.2));
            expect(event.getReverse()).toEqual(new MoveEvent(ship, new ArenaLocationAngle(5, 10, 1.2), new ArenaLocationAngle(0, 0, 0)));
        });
    });
}