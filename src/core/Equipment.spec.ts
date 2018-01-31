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

            TestTools.setAttribute(ship, "skill_time", 1);

            check.equals(equipment.canBeEquipped(ship.attributes), false);

            TestTools.setAttribute(ship, "skill_time", 2);

            check.equals(equipment.canBeEquipped(ship.attributes), true);

            TestTools.setAttribute(ship, "skill_time", 3);

            check.equals(equipment.canBeEquipped(ship.attributes), true);

            // Second requirement
            equipment.requirements["skill_materials"] = 3;

            check.equals(equipment.canBeEquipped(ship.attributes), false);

            TestTools.setAttribute(ship, "skill_materials", 4);

            check.equals(equipment.canBeEquipped(ship.attributes), true);
        });

        test.case("generates a description of the effects", check => {
            let equipment = new Equipment();
            check.equals(equipment.getEffectsDescription(), "does nothing");

            let action = new TriggerAction(equipment, [new DamageEffect(50)], 1, 200, 0);
            equipment.action = action;
            check.equals(equipment.getEffectsDescription(), "Fire (power 1, range 200km):\n• do 50 damage on target");

            action = new TriggerAction(equipment, [new DamageEffect(50)], 1, 200, 20);
            equipment.action = action;
            check.equals(equipment.getEffectsDescription(), "Fire (power 1, range 200km):\n• do 50 damage in 20km radius");

            action = new TriggerAction(equipment, [
                new DamageEffect(50),
                new StickyEffect(new AttributeLimitEffect("shield_capacity", 200), 3)
            ], 1, 200, 0);
            equipment.action = action;
            check.equals(equipment.getEffectsDescription(), "Fire (power 1, range 200km):\n• do 50 damage on target\n• limit shield capacity to 200 for 3 turns on target");
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
            check.equals(equipment.getPrice(), 97);

            equipment.addWear(89);
            check.equals(equipment.getPrice(), 83);

            equipment.addWear(400);
            check.equals(equipment.getPrice(), 50);

            equipment.addWear(12500);
            check.equals(equipment.getPrice(), 3);
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
