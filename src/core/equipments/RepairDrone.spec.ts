module TS.SpaceTac.Equipments {
    describe("RepairDrone", function () {
        it("generates equipment based on level", function () {
            let template = new RepairDrone();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_human": 1 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 300, 1, 100, [new ValueEffect("hull", 30)]));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_human": 2 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 310, 1, 110, [new ValueEffect("hull", 33)]));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_human": 3 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 320, 1, 120, [new ValueEffect("hull", 36)]));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_human": 10 });
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 390, 2, 190, [new ValueEffect("hull", 57)]));
        });

        it("generates a drone that may repair ships hull", function () {
            let template = new RepairDrone();

            let equipment = template.generate(1);
            expect(equipment.action).toEqual(new DeployDroneAction(equipment, 4, 300, 1, 100, [new ValueEffect("hull", 30)]));

            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            battle.playing_ship = ship;
            battle.play_order = [ship];
            TestTools.setShipAP(ship, 10);
            let result = equipment.action.apply(ship, new Target(5, 5, null));
            expect(result).toBe(true);

            expect(battle.drones.length).toBe(1);
            let drone = battle.drones[0];
            expect(drone.duration).toBe(1);
            ship.setAttribute("hull_capacity", 100);
            ship.setValue("hull", 55);
            drone.apply([ship]);
            expect(ship.getValue("hull")).toBe(85);
            drone.apply([ship]);
            expect(ship.getValue("hull")).toBe(100);
        });
    });
}
