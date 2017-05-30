module TS.SpaceTac.Specs {
    describe("ValueChangeEvent", function () {
        it("get reverse event", function () {
            let ship = new Ship();
            let event = new ValueChangeEvent(ship, new ShipValue("hull", 15, 22), 10);
            expect(event.getReverse()).toEqual(new ValueChangeEvent(ship, new ShipValue("hull", 5, 22), -10));
        });
    });
}