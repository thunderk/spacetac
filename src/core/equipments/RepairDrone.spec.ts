module TK.SpaceTac.Equipments {
    describe("RepairDrone", function () {
        it("generates equipment based on level", function () {
            let template = new RepairDrone();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_quantum": 1 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 300, 10, 150, [
                new ValueEffect("hull", 2)
            ]));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_quantum": 4 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 310, 11, 155, [
                new ValueEffect("hull", 3)
            ]));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_quantum": 7 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 322, 12, 161, [
                new ValueEffect("hull", 4)
            ]));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_quantum": 49 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 10, 462, 26, 231, [
                new ValueEffect("hull", 11)
            ]));
        });

        it("generates a drone that may repair ships hull", function () {
            let template = new RepairDrone();

            let equipment = template.generate(4);
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 5, 336, 13, 168, [
                new ValueEffect("hull", 5)
            ]));

            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            TestTools.setShipPlaying(battle, ship);
            TestTools.setShipAP(ship, 10);
            let result = nn(equipment.action).apply(ship, new Target(5, 5, null));
            expect(result).toBe(true);

            expect(battle.drones.length).toBe(1);
            let drone = battle.drones[0];
            expect(drone.duration).toBe(13);
            ship.setAttribute("hull_capacity", 100);
            ship.setValue("hull", 93);
            drone.apply([ship]);
            expect(ship.getValue("hull")).toBe(98);
            drone.apply([ship]);
            expect(ship.getValue("hull")).toBe(100);
        });
    });
}
