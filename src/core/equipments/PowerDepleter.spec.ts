module TK.SpaceTac.Equipments {
    testing("PowerDepleter", test => {
        test.case("generates equipment based on level", check => {
            let template = new PowerDepleter();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_antimatter": 1 });
            check.equals(equipment.action, new TriggerAction(equipment, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ], 4, 460, 0));
            check.equals(equipment.price, 100);

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_antimatter": 2 });
            check.equals(equipment.action, new TriggerAction(equipment, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ], 4, 490, 0));
            check.equals(equipment.price, 350);

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_antimatter": 4 });
            check.equals(equipment.action, new TriggerAction(equipment, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ], 4, 526, 0));
            check.equals(equipment.price, 850);

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_antimatter": 25 });
            check.equals(equipment.action, new TriggerAction(equipment, [
                new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 2, true)
            ], 4, 946, 0));
            check.equals(equipment.price, 11350);
        });
    });
}
