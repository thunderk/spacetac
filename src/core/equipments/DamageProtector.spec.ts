module TK.SpaceTac.Specs {
    testing("DamageProtector", test => {
        test.case("generates equipment based on level", check => {
            let template = new Equipments.DamageProtector();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_time": 3 });
            compare_toggle_action(check, equipment.action, new ToggleAction(equipment, 2, 300, [
                new DamageModifierEffect(-17)
            ]));

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_time": 4 });
            compare_toggle_action(check, equipment.action, new ToggleAction(equipment, 2, 310, [
                new DamageModifierEffect(-22)
            ]));

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_time": 5 });
            compare_toggle_action(check, equipment.action, new ToggleAction(equipment, 2, 322, [
                new DamageModifierEffect(-28)
            ]));

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_time": 22 });
            compare_toggle_action(check, equipment.action, new ToggleAction(equipment, 8, 462, [
                new DamageModifierEffect(-60)
            ]));
        });
    });
}
