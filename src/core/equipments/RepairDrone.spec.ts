module TS.SpaceTac.Equipments {
    describe("RepairDrone", function () {
        it("generates a drone that may repair ships hull", function () {
            let template = new RepairDrone();

            let equipment = template.generateFixed(0);
            expect(equipment.target_effects).toEqual([new ValueEffect("hull", 30)]);

            let battle = new Battle();
            let ship = new Ship();
            battle.playing_ship = ship;
            TestTools.setShipAP(ship, 10);
            let result = equipment.action.apply(battle, ship, new Target(5, 5, null));
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
