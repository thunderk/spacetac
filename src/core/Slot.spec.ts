module TS.SpaceTac.Specs {
    describe("Slot", () => {
        it("checks equipment type", () => {
            var ship = new Ship();
            var slot = ship.addSlot(SlotType.Engine);

            var equipment = new Equipment();
            equipment.slot_type = SlotType.Weapon;

            expect(slot.attached).toBeNull();
            slot.attach(equipment);
            expect(slot.attached).toBeNull();

            equipment.slot_type = SlotType.Engine;

            slot.attach(equipment);
            expect(slot.attached).toBe(equipment);
        });

        it("checks equipment capabilities", () => {
            var ship = new Ship();
            var slot = ship.addSlot(SlotType.Shield);

            var equipment = new Equipment();
            equipment.slot_type = SlotType.Shield;
            equipment.requirements["skill_gravity"] = 5;

            expect(slot.attached).toBeNull();
            slot.attach(equipment);
            expect(slot.attached).toBeNull();

            ship.attributes.skill_gravity.set(6);

            slot.attach(equipment);
            expect(slot.attached).toBe(equipment);
        });
    });
}
