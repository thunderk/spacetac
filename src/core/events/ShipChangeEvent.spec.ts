module TS.SpaceTac.Specs {
    describe("ShipChangeEvent", function () {
        it("get reverse event", function () {
            let ship1 = new Ship();
            let ship2 = new Ship();
            let event = new ShipChangeEvent(ship1, ship2);
            expect(event.getReverse()).toEqual(new ShipChangeEvent(ship2, ship1));
        });
    });
}