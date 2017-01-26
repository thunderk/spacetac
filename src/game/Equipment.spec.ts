module TS.SpaceTac.Game.Specs {
    describe("Equipment", () => {
        it("checks capabilities requirements", function () {
            var equipment = new Equipment();
            var ship = new Ship();

            expect(equipment.canBeEquipped(ship)).toBe(true);

            equipment.requirements.push(new Attribute(AttributeCode.Cap_Time, 2));

            expect(equipment.canBeEquipped(ship)).toBe(false);

            ship.cap_time.set(1);

            expect(equipment.canBeEquipped(ship)).toBe(false);

            ship.cap_time.set(2);

            expect(equipment.canBeEquipped(ship)).toBe(true);

            ship.cap_time.set(3);

            expect(equipment.canBeEquipped(ship)).toBe(true);

            // Second requirement
            equipment.requirements.push(new Attribute(AttributeCode.Cap_Material, 3));

            expect(equipment.canBeEquipped(ship)).toBe(false);

            ship.cap_material.set(4);

            expect(equipment.canBeEquipped(ship)).toBe(true);
        });

        it("generates a description of the effects", function () {
            var equipment = new Equipment();
            equipment.distance = 3;
            expect(equipment.getActionDescription()).toEqual("does nothing");

            equipment.target_effects.push(new DamageEffect(50));
            expect(equipment.getActionDescription()).toEqual("- 50 damage on target");

            equipment.blast = 20;
            expect(equipment.getActionDescription()).toEqual("- 50 damage on all ships in 20km of impact");

            equipment.blast = 0;
            equipment.target_effects.push(new StickyEffect(new AttributeLimitEffect(AttributeCode.Shield, 200), 3));
            expect(equipment.getActionDescription()).toEqual("- 50 damage on target\n- limit shield to 200 for 3 turns on target");
        });
    });
}
