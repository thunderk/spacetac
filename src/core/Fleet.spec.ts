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

        it("adds and removes ships", function () {
            let fleet1 = new Fleet();
            let fleet2 = new Fleet();

            let ship1 = fleet1.addShip();
            expect(fleet1.ships).toEqual([ship1]);
            expect(fleet2.ships).toEqual([]);

            let ship2 = new Ship();
            expect(fleet1.ships).toEqual([ship1]);
            expect(fleet2.ships).toEqual([]);

            fleet2.addShip(ship2);
            expect(fleet1.ships).toEqual([ship1]);
            expect(fleet2.ships).toEqual([ship2]);

            fleet1.addShip(ship2);
            expect(fleet1.ships).toEqual([ship1, ship2]);
            expect(fleet2.ships).toEqual([]);

            fleet1.removeShip(ship1, fleet2);
            expect(fleet1.ships).toEqual([ship2]);
            expect(fleet2.ships).toEqual([ship1]);

            fleet1.removeShip(ship1);
            expect(fleet1.ships).toEqual([ship2]);
            expect(fleet2.ships).toEqual([ship1]);

            fleet1.removeShip(ship2);
            expect(fleet1.ships).toEqual([]);
            expect(fleet2.ships).toEqual([ship1]);
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

        it("checks if a fleet is alive", function () {
            let fleet = new Fleet();
            expect(fleet.isAlive()).toBe(false);

            let ship1 = fleet.addShip();
            expect(fleet.isAlive()).toBe(true);

            let ship2 = fleet.addShip();
            expect(fleet.isAlive()).toBe(true);

            ship1.setDead();
            expect(fleet.isAlive()).toBe(true);

            ship2.setDead();
            expect(fleet.isAlive()).toBe(false);

            let ship3 = fleet.addShip();
            expect(fleet.isAlive()).toBe(true);

            let ship4 = fleet.addShip();
            ship4.critical = true;
            expect(fleet.isAlive()).toBe(true);

            ship4.setDead();
            expect(fleet.isAlive()).toBe(false);
        });

        it("adds cargo in first empty slot", function () {
            let fleet = new Fleet();
            let ship1 = fleet.addShip();
            ship1.cargo_space = 1;
            let ship2 = fleet.addShip();
            ship2.cargo_space = 2;

            expect(ship1.cargo).toEqual([]);
            expect(ship2.cargo).toEqual([]);

            let result = fleet.addCargo(new Equipment());
            expect(result).toBe(true);
            expect(ship1.cargo).toEqual([new Equipment()]);
            expect(ship2.cargo).toEqual([]);

            result = fleet.addCargo(new Equipment());
            expect(result).toBe(true);
            expect(ship1.cargo).toEqual([new Equipment()]);
            expect(ship2.cargo).toEqual([new Equipment()]);

            result = fleet.addCargo(new Equipment());
            expect(result).toBe(true);
            expect(ship1.cargo).toEqual([new Equipment()]);
            expect(ship2.cargo).toEqual([new Equipment(), new Equipment()]);

            result = fleet.addCargo(new Equipment());
            expect(result).toBe(false);
            expect(ship1.cargo).toEqual([new Equipment()]);
            expect(ship2.cargo).toEqual([new Equipment(), new Equipment()]);
        });
    });
}
