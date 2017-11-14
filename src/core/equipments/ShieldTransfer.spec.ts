module TK.SpaceTac.Specs {
    testing("ShieldTransfer", test => {
        test.case("generates equipment based on level", check => {
            let template = new Equipments.ShieldTransfer();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_gravity": 2 });
            check.equals(equipment.cooldown, new Cooldown(3, 3));
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [
                new ValueTransferEffect("shield", -40)
            ], 3, 0, 250));

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_gravity": 3 });
            check.equals(equipment.cooldown, new Cooldown(3, 3));
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [
                new ValueTransferEffect("shield", -44)
            ], 3, 0, 270));

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_gravity": 5 });
            check.equals(equipment.cooldown, new Cooldown(3, 3));
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [
                new ValueTransferEffect("shield", -49)
            ], 3, 0, 294));

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_gravity": 26 });
            check.equals(equipment.cooldown, new Cooldown(3, 3));
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [
                new ValueTransferEffect("shield", -105)
            ], 3, 0, 574));
        })
    })
}
