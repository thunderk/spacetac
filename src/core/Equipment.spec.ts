module TS.SpaceTac.Specs {
    describe("Equipment", () => {
        it("checks capabilities requirements", function () {
            var equipment = new Equipment();
            var ship = new Ship();

            expect(equipment.canBeEquipped(ship)).toBe(true);

            equipment.requirements["skill_time"] = 2;

            expect(equipment.canBeEquipped(ship)).toBe(false);

            ship.attributes.skill_time.set(1);

            expect(equipment.canBeEquipped(ship)).toBe(false);

            ship.attributes.skill_time.set(2);

            expect(equipment.canBeEquipped(ship)).toBe(true);

            ship.attributes.skill_time.set(3);

            expect(equipment.canBeEquipped(ship)).toBe(true);

            // Second requirement
            equipment.requirements["skill_material"] = 3;

            expect(equipment.canBeEquipped(ship)).toBe(false);

            ship.attributes.skill_material.set(4);

            expect(equipment.canBeEquipped(ship)).toBe(true);
        });

        it("generates a description of the effects", function () {
            var equipment = new Equipment();
            equipment.distance = 3;
            expect(equipment.getActionDescription()).toEqual("does nothing");

            equipment.target_effects.push(new DamageEffect(50));
            expect(equipment.getActionDescription()).toEqual("- 50 damage on target");

            equipment.blast = 20;
            expect(equipment.getActionDescription()).toEqual("- 50 damage in 20km radius");

            equipment.blast = 0;
            equipment.target_effects.push(new StickyEffect(new AttributeLimitEffect("shield_capacity", 200), 3));
            expect(equipment.getActionDescription()).toEqual("- 50 damage on target\n- limit shield capacity to 200 for 3 turns on target");
        });
    });
}
