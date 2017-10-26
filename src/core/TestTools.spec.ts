module TK.SpaceTac.Specs {
    testing("TestTools", test => {
        test.case("set ship power", check => {
            let ship = new Ship();

            check.equals(ship.getAttribute("power_capacity"), 0);
            check.equals(ship.getAttribute("power_generation"), 0);
            check.equals(ship.getValue("power"), 0);

            TestTools.setShipAP(ship, 12, 4);

            check.equals(ship.getAttribute("power_capacity"), 12);
            check.equals(ship.getAttribute("power_generation"), 4);
            check.equals(ship.getValue("power"), 12);
        });

        test.case("set ship health", check => {
            let ship = new Ship();

            check.equals(ship.getAttribute("hull_capacity"), 0);
            check.equals(ship.getAttribute("shield_capacity"), 0);
            check.equals(ship.getValue("hull"), 0);
            check.equals(ship.getValue("shield"), 0);

            TestTools.setShipHP(ship, 100, 200);

            check.equals(ship.getAttribute("hull_capacity"), 100);
            check.equals(ship.getAttribute("shield_capacity"), 200);
            check.equals(ship.getValue("hull"), 100);
            check.equals(ship.getValue("shield"), 200);
        });
    });
}