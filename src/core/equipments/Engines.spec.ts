module TK.SpaceTac.Specs {
    testing("Engines", test => {
        test.case("generates RocketEngine based on level", check => {
            let template = new Equipments.RocketEngine();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_materials": 1 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", 2)]);
            check.equals(equipment.cooldown, new Cooldown(2, 0));
            compare_action(check, equipment.action, new MoveAction(equipment, 200, 120, 70));
            check.equals(equipment.price, 120);

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_materials": 2 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", 2)]);
            check.equals(equipment.cooldown, new Cooldown(2, 0));
            compare_action(check, equipment.action, new MoveAction(equipment, 210, 120, 70));
            check.equals(equipment.price, 420);

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_materials": 3 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", 3)]);
            check.equals(equipment.cooldown, new Cooldown(2, 0));
            compare_action(check, equipment.action, new MoveAction(equipment, 220, 120, 70));
            check.equals(equipment.price, 1020);

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_materials": 17 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", 14)]);
            check.equals(equipment.cooldown, new Cooldown(2, 0));
            compare_action(check, equipment.action, new MoveAction(equipment, 290, 120, 70));
            check.equals(equipment.price, 13620);
        });

        test.case("generates IonThruster based on level", check => {
            let template = new Equipments.IonThruster();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_photons": 1 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", 1)]);
            check.equals(equipment.cooldown, new Cooldown(3, 1));
            compare_action(check, equipment.action, new MoveAction(equipment, 120, 120, 80));
            check.equals(equipment.price, 150);

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_photons": 2 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", 2)]);
            check.equals(equipment.cooldown, new Cooldown(3, 1));
            compare_action(check, equipment.action, new MoveAction(equipment, 130, 120, 80));
            check.equals(equipment.price, 525);

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_photons": 3 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", 3)]);
            check.equals(equipment.cooldown, new Cooldown(3, 1));
            compare_action(check, equipment.action, new MoveAction(equipment, 140, 120, 80));
            check.equals(equipment.price, 1275);

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_photons": 17 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", 17)]);
            check.equals(equipment.cooldown, new Cooldown(3, 1));
            compare_action(check, equipment.action, new MoveAction(equipment, 210, 120, 80));
            check.equals(equipment.price, 17025);
        });

        test.case("generates VoidhawkEngine based on level", check => {
            let template = new Equipments.VoidhawkEngine();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_gravity": 2 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", -3)]);
            check.equals(equipment.cooldown, new Cooldown(1, 0));
            compare_action(check, equipment.action, new MoveAction(equipment, 2000, 270, 0));
            check.equals(equipment.price, 300);

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_gravity": 3 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", -4)]);
            check.equals(equipment.cooldown, new Cooldown(1, 0));
            compare_action(check, equipment.action, new MoveAction(equipment, 2000, 245, 0));
            check.equals(equipment.price, 1050);

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_gravity": 5 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", -4)]);
            check.equals(equipment.cooldown, new Cooldown(1, 0));
            compare_action(check, equipment.action, new MoveAction(equipment, 2000, 224, 0));
            check.equals(equipment.price, 2550);

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_gravity": 26 });
            compare_effects(check, equipment.effects, [new AttributeEffect("maneuvrability", -5)]);
            check.equals(equipment.cooldown, new Cooldown(2, 0));
            compare_action(check, equipment.action, new MoveAction(equipment, 2000, 155, 0));
            check.equals(equipment.price, 34050);
        });
    });
}
