module TK.SpaceTac.Specs {
    testing("Equipment", test => {
        test.case("generates a full name", check => {
            let equipment = new Equipment(SlotType.Weapon, "rayofdeath");
            check.equals(equipment.getFullName(), "rayofdeath Mk1");

            equipment.name = "Ray of Death";
            check.equals(equipment.getFullName(), "Ray of Death Mk1");

            equipment.quality = EquipmentQuality.LEGENDARY;
            check.equals(equipment.getFullName(), "Legendary Ray of Death Mk1");
        });

        test.case("checks capabilities requirements", check => {
            var equipment = new Equipment();
            var ship = new Ship();

            check.equals(equipment.canBeEquipped(ship.attributes), true);

            equipment.requirements["skill_time"] = 2;

            check.equals(equipment.canBeEquipped(ship.attributes), false);

            ship.attributes.skill_time.set(1);

            check.equals(equipment.canBeEquipped(ship.attributes), false);

            ship.attributes.skill_time.set(2);

            check.equals(equipment.canBeEquipped(ship.attributes), true);

            ship.attributes.skill_time.set(3);

            check.equals(equipment.canBeEquipped(ship.attributes), true);

            // Second requirement
            equipment.requirements["skill_materials"] = 3;

            check.equals(equipment.canBeEquipped(ship.attributes), false);

            ship.attributes.skill_materials.set(4);

            check.equals(equipment.canBeEquipped(ship.attributes), true);
        });

        test.case("generates a description of the effects", check => {
            let equipment = new Equipment();
            check.equals(equipment.getEffectsDescription(), "does nothing");

            let action = new TriggerAction(equipment, [new DamageEffect(50)], 1, 200, 0);
            equipment.action = action;
            check.equals(equipment.getEffectsDescription(), "Fire (power usage 1, max range 200km):\n• do 50 damage on target");

            action.blast = 20;
            check.equals(equipment.getEffectsDescription(), "Fire (power usage 1, max range 200km):\n• do 50 damage in 20km radius");

            action.blast = 0;
            action.effects.push(new StickyEffect(new AttributeLimitEffect("shield_capacity", 200), 3));
            check.equals(equipment.getEffectsDescription(), "Fire (power usage 1, max range 200km):\n• do 50 damage on target\n• limit shield capacity to 200 for 3 turns on target");
        });

        test.case("gets a minimal level, based on skills requirements", check => {
            let equipment = new Equipment();
            check.equals(equipment.getMinimumLevel(), 1);

            equipment.requirements["skill_quantum"] = 10;
            check.equals(equipment.getMinimumLevel(), 1);

            equipment.requirements["skill_time"] = 1;
            check.equals(equipment.getMinimumLevel(), 2);

            equipment.requirements["skill_gravity"] = 2;
            check.equals(equipment.getMinimumLevel(), 2);

            equipment.requirements["skill_antimatter"] = 4;
            check.equals(equipment.getMinimumLevel(), 3);
        });

        test.case("weighs the price, taking wear into account", check => {
            let equipment = new Equipment();
            check.equals(equipment.getPrice(), 0);

            equipment.price = 100;
            check.equals(equipment.getPrice(), 100);

            equipment.addWear(1);
            check.equals(equipment.getPrice(), 99);

            equipment.addWear(10);
            check.equals(equipment.getPrice(), 90);

            equipment.addWear(89);
            check.equals(equipment.getPrice(), 50);

            equipment.addWear(400);
            check.equals(equipment.getPrice(), 16);
        });

        test.case("builds a full textual description", check => {
            let equipment = new Equipment();
            equipment.name = "Super Equipment";
            equipment.requirements["skill_gravity"] = 2;
            equipment.effects.push(new AttributeEffect("skill_time", 3));
            equipment.wear = 50;

            let result = equipment.getFullDescription();
            check.equals(result, "Second hand\n\nRequires:\n• gravity skill 2\n\nWhen equipped:\n• time skill +3");
        });
    });
}
