module TK.SpaceTac.Specs {
    testing("RepairDrone", test => {
        test.case("generates equipment based on level", check => {
            let template = new Equipments.RepairDrone();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_quantum": 1 });
            compare_drone_action(check, equipment.action, new DeployDroneAction(equipment, 3, 300, 150, [
                new ValueEffect("hull", 0, 0, 0, 30)
            ]));

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_quantum": 4 });
            compare_drone_action(check, equipment.action, new DeployDroneAction(equipment, 3, 310, 155, [
                new ValueEffect("hull", 0, 0, 0, 42)
            ]));

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_quantum": 7 });
            compare_drone_action(check, equipment.action, new DeployDroneAction(equipment, 3, 322, 161, [
                new ValueEffect("hull", 0, 0, 0, 56)
            ]));

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_quantum": 49 });
            compare_drone_action(check, equipment.action, new DeployDroneAction(equipment, 6, 462, 231, [
                new ValueEffect("hull", 0, 0, 0, 224)
            ]));
        });
    });
}
