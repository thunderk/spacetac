module TK.SpaceTac.Specs {
    testing("ShipChangeEvent", test => {
        test.case("get reverse event", check => {
            let ship1 = new Ship();
            let ship2 = new Ship();
            let event = new ShipChangeEvent(ship1, ship2);
            check.equals(event.getReverse(), new ShipChangeEvent(ship2, ship1));
        });
    });
}