module TS.SpaceTac.Equipments {
    describe("RepairDrone", function () {
        it("generates equipment based on level", function () {
            let template = new RepairDrone();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_quantum": 1 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 300, 10, 150, [new ValueEffect("hull", 5)]));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_quantum": 2 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 310, 11, 155, [new ValueEffect("hull", 6)]));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_quantum": 3 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 320, 12, 160, [new ValueEffect("hull", 7)]));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_quantum": 10 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 390, 19, 195, [new ValueEffect("hull", 14)]));
        });

        it("generates a drone that may repair ships hull", function () {
            let template = new RepairDrone();

            let equipment = template.generate(1);
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 300, 10, 150, [new ValueEffect("hull", 5)]));

            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            battle.playing_ship = ship;
            battle.play_order = [ship];
            TestTools.setShipAP(ship, 10);
            let result = equipment.action.apply(ship, new Target(5, 5, null));
            expect(result).toBe(true);

            expect(battle.drones.length).toBe(1);
            let drone = battle.drones[0];
            expect(drone.duration).toBe(10);
            ship.setAttribute("hull_capacity", 100);
            ship.setValue("hull", 93);
            drone.apply([ship]);
            expect(ship.getValue("hull")).toBe(98);
            drone.apply([ship]);
            expect(ship.getValue("hull")).toBe(100);
        });
    });
}
