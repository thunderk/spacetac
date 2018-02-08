module TK.SpaceTac.Specs {
    testing("TestTools", test => {
        test.case("set ship health and power", check => {
            let ship = new Ship();

            check.equals(ship.getAttribute("hull_capacity"), 0);
            check.equals(ship.getAttribute("shield_capacity"), 0);
            check.equals(ship.getAttribute("power_capacity"), 0);
            check.equals(ship.getValue("hull"), 0);
            check.equals(ship.getValue("shield"), 0);
            check.equals(ship.getValue("power"), 0);

            TestTools.setShipModel(ship, 100, 200, 12);

            check.equals(ship.getAttribute("hull_capacity"), 100);
            check.equals(ship.getAttribute("shield_capacity"), 200);
            check.equals(ship.getAttribute("power_capacity"), 12);
            check.equals(ship.getValue("hull"), 100);
            check.equals(ship.getValue("shield"), 200);
            check.equals(ship.getValue("power"), 12);
        });
    });
}