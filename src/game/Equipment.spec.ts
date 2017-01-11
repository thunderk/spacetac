module SpaceTac.Game.Specs {
    describe("Equipment", () => {
        it("checks capabilities requirements", () => {
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
    });
}
