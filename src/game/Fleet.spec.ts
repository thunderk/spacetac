module TS.SpaceTac.Game {
    describe("Fleet", function () {
        it("get average level", function () {
            var fleet = new Fleet();
            expect(fleet.getLevel()).toEqual(0);

            fleet.addShip(new Ship());
            fleet.addShip(new Ship());
            fleet.addShip(new Ship());

            fleet.ships[0].level = 2;
            fleet.ships[1].level = 4;
            fleet.ships[2].level = 7;
            expect(fleet.getLevel()).toEqual(4);
        });
    });
}
