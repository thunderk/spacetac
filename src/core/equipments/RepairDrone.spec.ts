module TK.SpaceTac.Specs {
    testing("RepairDrone", test => {
        test.case("generates equipment based on level", check => {
            let template = new Equipments.RepairDrone();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_quantum": 1 });
            compare_drone_action(check, equipment.action, new DeployDroneAction(equipment, 4, 300, 10, 150, [
                new ValueEffect("hull", 2)
            ]));

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_quantum": 4 });
            compare_drone_action(check, equipment.action, new DeployDroneAction(equipment, 4, 310, 11, 155, [
                new ValueEffect("hull", 3)
            ]));

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_quantum": 7 });
            compare_drone_action(check, equipment.action, new DeployDroneAction(equipment, 4, 322, 12, 161, [
                new ValueEffect("hull", 4)
            ]));

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_quantum": 49 });
            compare_drone_action(check, equipment.action, new DeployDroneAction(equipment, 10, 462, 26, 231, [
                new ValueEffect("hull", 11)
            ]));
        });
    });
}
