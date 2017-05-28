module TS.SpaceTac.Specs {
    describe("Equipment", () => {
        it("generates a full name", function () {
            let equipment = new Equipment(SlotType.Weapon, "rayofdeath");
            expect(equipment.getFullName()).toEqual("rayofdeath Mk1");

            equipment.name = "Ray of Death";
            expect(equipment.getFullName()).toEqual("Ray of Death Mk1");

            equipment.quality = EquipmentQuality.LEGENDARY;
            expect(equipment.getFullName()).toEqual("Legendary Ray of Death Mk1");
        });

        it("checks capabilities requirements", function () {
            var equipment = new Equipment();
            var ship = new Ship();

            expect(equipment.canBeEquipped(ship.attributes)).toBe(true);

            equipment.requirements["skill_time"] = 2;

            expect(equipment.canBeEquipped(ship.attributes)).toBe(false);

            ship.attributes.skill_time.set(1);

            expect(equipment.canBeEquipped(ship.attributes)).toBe(false);

            ship.attributes.skill_time.set(2);

            expect(equipment.canBeEquipped(ship.attributes)).toBe(true);

            ship.attributes.skill_time.set(3);

            expect(equipment.canBeEquipped(ship.attributes)).toBe(true);

            // Second requirement
            equipment.requirements["skill_material"] = 3;

            expect(equipment.canBeEquipped(ship.attributes)).toBe(false);

            ship.attributes.skill_material.set(4);

            expect(equipment.canBeEquipped(ship.attributes)).toBe(true);
        });

        it("generates a description of the effects", function () {
            let equipment = new Equipment();
            expect(equipment.getEffectsDescription()).toEqual("does nothing");

            let action = new FireWeaponAction(equipment, 1, 200, 0, [
                new DamageEffect(50)
            ]);
            equipment.action = action;
            expect(equipment.getEffectsDescription()).toEqual("Fire (power usage 1, max range 200km):\n• do 50 damage on target");

            action.blast = 20;
            expect(equipment.getEffectsDescription()).toEqual("Fire (power usage 1, max range 200km):\n• do 50 damage in 20km radius");

            action.blast = 0;
            action.effects.push(new StickyEffect(new AttributeLimitEffect("shield_capacity", 200), 3));
            expect(equipment.getEffectsDescription()).toEqual("Fire (power usage 1, max range 200km):\n• do 50 damage on target\n• limit shield capacity to 200 for 3 turns on target");
        });

        it("gets a minimal level, based on skills requirements", function () {
            let equipment = new Equipment();
            expect(equipment.getMinimumLevel()).toBe(1);

            equipment.requirements["skill_human"] = 10;
            expect(equipment.getMinimumLevel()).toBe(1);

            equipment.requirements["skill_time"] = 1;
            expect(equipment.getMinimumLevel()).toBe(2);

            equipment.requirements["skill_gravity"] = 2;
            expect(equipment.getMinimumLevel()).toBe(2);

            equipment.requirements["skill_electronics"] = 4;
            expect(equipment.getMinimumLevel()).toBe(3);
        });

        it("weighs the price, taking wear into account", function () {
            let equipment = new Equipment();
            expect(equipment.getPrice()).toBe(0);

            equipment.price = 100;
            expect(equipment.getPrice()).toBe(100);

            equipment.addWear(1);
            expect(equipment.getPrice()).toBe(99);

            equipment.addWear(10);
            expect(equipment.getPrice()).toBe(90);

            equipment.addWear(89);
            expect(equipment.getPrice()).toBe(50);

            equipment.addWear(400);
            expect(equipment.getPrice()).toBe(16);
        });

        it("builds a full textual description", function () {
            let equipment = new Equipment();
            equipment.name = "Super Equipment";
            equipment.requirements["skill_gravity"] = 2;
            equipment.effects.push(new AttributeEffect("skill_time", 3));
            equipment.wear = 50;

            let result = equipment.getFullDescription();
            expect(result).toEqual("Second hand\n\nRequires:\n• gravity skill 2\n\nWhen equipped:\n• time skill +3");
        });
    });
}
