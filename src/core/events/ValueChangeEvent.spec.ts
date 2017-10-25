/// <reference path="../../common/Testing.ts" />

module TK.SpaceTac.Specs {
    testing("ValueChangeEvent", test => {
        test.case("get reverse event", check => {
            let ship = new Ship();
            let event = new ValueChangeEvent(ship, new ShipValue("hull", 15, 22), 10);
            check.equals(event.getReverse(), new ValueChangeEvent(ship, new ShipValue("hull", 5, 22), -10));
        });

        test.case("applies and reverts", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            check.equals(ship.getValue("hull"), 0);

            let events = ship.getValueEvents("hull", 15);
            check.equals(ship.getValue("hull"), 0);
            check.equals(events.length, 1);

            events[0].apply(battle);
            check.equals(ship.getValue("hull"), 15);

            events[0].revert(battle);
            check.equals(ship.getValue("hull"), 0);
        });
    });
}