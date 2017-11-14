module TK.SpaceTac.Specs {
    testing("Generators", test => {
        test.case("generates NuclearReactor based on level", check => {
            let template = new Equipments.NuclearReactor();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_photons": 1 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("maneuvrability", 1),
                new AttributeEffect("power_capacity", 7),
                new AttributeEffect("power_generation", 4),
            ]);
            check.equals(equipment.price, 395);

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_photons": 3 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("maneuvrability", 2),
                new AttributeEffect("power_capacity", 7),
                new AttributeEffect("power_generation", 5),
            ]);
            check.equals(equipment.price, 1382);

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_photons": 5 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("maneuvrability", 3),
                new AttributeEffect("power_capacity", 8),
                new AttributeEffect("power_generation", 5),
            ]);
            check.equals(equipment.price, 3357);

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_photons": 33 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("maneuvrability", 10),
                new AttributeEffect("power_capacity", 15),
                new AttributeEffect("power_generation", 12),
            ]);
            check.equals(equipment.price, 44832);
        })

        test.case("generates KelvinGenerator based on level", check => {
            let template = new Equipments.KelvinGenerator();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_time": 1 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("power_capacity", 5),
                new AttributeEffect("power_generation", 4),
            ]);
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new CooldownEffect(1, 1)]));
            check.equals(equipment.price, 420);

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_time": 2 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("power_capacity", 6),
                new AttributeEffect("power_generation", 4),
            ]);
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new CooldownEffect(1, 1)]));
            check.equals(equipment.price, 1470);

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_time": 4, "skill_gravity": 1 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("power_capacity", 6),
                new AttributeEffect("power_generation", 5),
            ]);
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new CooldownEffect(1, 1)]));
            check.equals(equipment.price, 3570);

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_time": 28, "skill_gravity": 6 });
            compare_effects(check, equipment.effects, [
                new AttributeEffect("power_capacity", 13),
                new AttributeEffect("power_generation", 12),
            ]);
            compare_trigger_action(check, equipment.action, new TriggerAction(equipment, [new CooldownEffect(4, 7)], 7));
            check.equals(equipment.price, 47670);
        })
    })
}
