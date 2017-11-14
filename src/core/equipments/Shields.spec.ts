module TK.SpaceTac.Specs {
    testing("Shields", test => {
        test.case("generates ForceField based on level", check => {
            let template = new Equipments.ForceField();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_photons": 1 });
            compare_effects(check, equipment.effects, [new AttributeEffect("shield_capacity", 80)]);
            check.equals(equipment.price, 95);

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_photons": 3 });
            compare_effects(check, equipment.effects, [new AttributeEffect("shield_capacity", 112)]);
            check.equals(equipment.price, 332);

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_photons": 5 });
            compare_effects(check, equipment.effects, [new AttributeEffect("shield_capacity", 150)]);
            check.equals(equipment.price, 807);

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_photons": 33 });
            compare_effects(check, equipment.effects, [new AttributeEffect("shield_capacity", 598)]);
            check.equals(equipment.price, 10782);
        });

        test.case("generates GravitShield based on level", check => {
            let template = new Equipments.GravitShield();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_gravity": 2 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("shield_capacity", 60),
            ]);
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new RepelEffect(100)], 2, 0, 300));
            check.equals(equipment.price, 140);

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_gravity": 5 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("shield_capacity", 84),
            ]);
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new RepelEffect(105)], 2, 0, 310));
            check.equals(equipment.price, 490);

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_gravity": 8 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("shield_capacity", 112),
            ]);
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new RepelEffect(111)], 2, 0, 322));
            check.equals(equipment.price, 1190);

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_gravity": 50 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("shield_capacity", 448),
            ]);
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new RepelEffect(181)], 2, 0, 462));
            check.equals(equipment.price, 15890);
        });

        test.case("generates InverterShield based on level", check => {
            let template = new Equipments.InverterShield();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_antimatter": 2, "skill_time": 1 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("shield_capacity", 140),
                new AttributeEffect("power_capacity", -1),
            ]);
            check.equals(equipment.price, 258);

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_antimatter": 3, "skill_time": 2 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("shield_capacity", 196),
                new AttributeEffect("power_capacity", -1),
            ]);
            check.equals(equipment.price, 903);

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_antimatter": 5, "skill_time": 3 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("shield_capacity", 263),
                new AttributeEffect("power_capacity", -1),
            ]);
            check.equals(equipment.price, 2193);

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_antimatter": 26, "skill_time": 17 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("shield_capacity", 1047),
                new AttributeEffect("power_capacity", -4),
            ]);
            check.equals(equipment.price, 29283);
        });
    });
}
