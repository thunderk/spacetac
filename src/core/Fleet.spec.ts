module TS.SpaceTac {
    describe("Fleet", function () {
        it("get average level", function () {
            var fleet = new Fleet();
            expect(fleet.getLevel()).toEqual(0);

            fleet.addShip(new Ship());
            fleet.addShip(new Ship());
            fleet.addShip(new Ship());

            fleet.ships[0].level.forceLevel(2);
            fleet.ships[1].level.forceLevel(4);
            fleet.ships[2].level.forceLevel(7);
            expect(fleet.getLevel()).toEqual(4);
        });

        it("changes location, only using jumps to travel between systems", function () {
            let fleet = new Fleet();
            let system1 = new Star();
            let system2 = new Star();
            let jump1 = new StarLocation(system1, StarLocationType.WARP);
            let jump2 = new StarLocation(system2, StarLocationType.WARP);
            jump1.setJumpDestination(jump2);
            jump2.setJumpDestination(jump1);
            let other1 = new StarLocation(system1, StarLocationType.PLANET);

            let result = fleet.setLocation(other1);
            expect(result).toBe(true);
            expect(fleet.location).toBe(other1);

            result = fleet.setLocation(jump2);
            expect(result).toBe(false);
            expect(fleet.location).toBe(other1);

            result = fleet.setLocation(jump1);
            expect(result).toBe(true);
            expect(fleet.location).toBe(jump1);

            result = fleet.setLocation(jump2);
            expect(result).toBe(true);
            expect(fleet.location).toBe(jump2);

            result = fleet.setLocation(other1);
            expect(result).toBe(false);
            expect(fleet.location).toBe(jump2);

            result = fleet.setLocation(jump1);
            expect(result).toBe(true);
            expect(fleet.location).toBe(jump1);
        });
    });
}
