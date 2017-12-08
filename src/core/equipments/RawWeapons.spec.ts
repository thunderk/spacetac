module TK.SpaceTac.Specs {
    testing("RawWeapons", test => {
        test.case("generates GatlingGun based on level", check => {
            let template = new Equipments.GatlingGun();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_materials": 1 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(30, 20)], 3, 400, 0, 0, 60, 20, 15));
            check.equals(equipment.price, 100);
            check.equals(equipment.cooldown, new Cooldown(2, 2));

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_materials": 2 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(42, 28)], 3, 412, 0, 0, 60, 20, 15));
            check.equals(equipment.price, 350);
            check.equals(equipment.cooldown, new Cooldown(2, 2));

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_materials": 4 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(56, 37)], 3, 426, 0, 0, 60, 20, 15));
            check.equals(equipment.price, 850);
            check.equals(equipment.cooldown, new Cooldown(2, 2));

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_materials": 23 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(224, 149)], 3, 594, 0, 0, 60, 20, 15));
            check.equals(equipment.price, 11350);
            check.equals(equipment.cooldown, new Cooldown(2, 2));
        });

        test.case("generates SubMunitionMissile based on level", check => {
            let template = new Equipments.SubMunitionMissile();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_materials": 1, "skill_photons": 1 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(26, 4)], 4, 500, 150, 0, 30, 40, 10));
            check.equals(equipment.cooldown, new Cooldown(1, 0));
            check.equals(equipment.price, 163);

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_materials": 2, "skill_photons": 1 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(28, 5)], 4, 520, 155, 0, 30, 40, 10));
            check.equals(equipment.cooldown, new Cooldown(1, 0));
            check.equals(equipment.price, 570);

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_materials": 3, "skill_photons": 2 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(30, 6)], 4, 544, 161, 0, 30, 40, 10));
            check.equals(equipment.cooldown, new Cooldown(1, 0));
            check.equals(equipment.price, 1385);

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_materials": 20, "skill_photons": 13 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(58, 20)], 4, 824, 231, 0, 30, 40, 10));
            check.equals(equipment.cooldown, new Cooldown(1, 0));
            check.equals(equipment.price, 18500);
        });

        test.case("generates ProkhorovLaser based on level", check => {
            let template = new Equipments.ProkhorovLaser();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_photons": 1, "skill_quantum": 1 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(20, 25)], 5, 300, 0, 40, 45, 60, 20));
            check.equals(equipment.cooldown, new Cooldown(1, 1));
            check.equals(equipment.price, 152);

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_antimatter": 1, "skill_photons": 2, "skill_quantum": 2 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(28, 35)], 5, 310, 0, 42, 45, 60, 20));
            check.equals(equipment.cooldown, new Cooldown(1, 1));
            check.equals(equipment.price, 532);

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_antimatter": 1, "skill_photons": 4, "skill_quantum": 3 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(37, 47)], 5, 322, 0, 44, 45, 60, 20));
            check.equals(equipment.cooldown, new Cooldown(1, 1));
            check.equals(equipment.price, 1292);

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_antimatter": 11, "skill_photons": 23, "skill_quantum": 20 });
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new DamageEffect(149, 187)], 5, 462, 0, 72, 45, 60, 20));
            check.equals(equipment.cooldown, new Cooldown(1, 1));
            check.equals(equipment.price, 17252);
        });
    });
}
