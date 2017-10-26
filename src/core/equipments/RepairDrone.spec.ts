module TK.SpaceTac.Equipments {
    testing("RepairDrone", test => {
        test.case("generates equipment based on level", check => {
            let template = new RepairDrone();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_quantum": 1 });
            check.equals(equipment.action, new DeployDroneAction(equipment, 4, 300, 10, 150, [
                new ValueEffect("hull", 2)
            ]));

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_quantum": 4 });
            check.equals(equipment.action, new DeployDroneAction(equipment, 4, 310, 11, 155, [
                new ValueEffect("hull", 3)
            ]));

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_quantum": 7 });
            check.equals(equipment.action, new DeployDroneAction(equipment, 4, 322, 12, 161, [
                new ValueEffect("hull", 4)
            ]));

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_quantum": 49 });
            check.equals(equipment.action, new DeployDroneAction(equipment, 10, 462, 26, 231, [
                new ValueEffect("hull", 11)
            ]));
        });

        test.case("generates a drone that may repair ships hull", check => {
            let template = new RepairDrone();

            let equipment = template.generate(4);
            check.equals(equipment.action, new DeployDroneAction(equipment, 5, 336, 13, 168, [
                new ValueEffect("hull", 5)
            ]));

            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            TestTools.setShipPlaying(battle, ship);
            TestTools.setShipAP(ship, 10);
            let result = nn(equipment.action).apply(ship, new Target(5, 5, null));
            check.equals(result, true);

            check.equals(battle.drones.length, 1);
            let drone = battle.drones[0];
            check.equals(drone.duration, 13);
            ship.setAttribute("hull_capacity", 100);
            ship.setValue("hull", 93);
            drone.apply([ship]);
            check.equals(ship.getValue("hull"), 98);
            drone.apply([ship]);
            check.equals(ship.getValue("hull"), 100);
        });
    });
}
