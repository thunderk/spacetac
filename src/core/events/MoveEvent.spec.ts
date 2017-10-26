module TK.SpaceTac.Specs {
    testing("MoveEvent", test => {
        test.case("get reverse event", check => {
            let ship = new Ship();
            let event = new MoveEvent(ship, new ArenaLocationAngle(0, 0, 0), new ArenaLocationAngle(5, 10, 1.2));
            check.equals(event.getReverse(), new MoveEvent(ship, new ArenaLocationAngle(5, 10, 1.2), new ArenaLocationAngle(0, 0, 0)));
        });
    });
}