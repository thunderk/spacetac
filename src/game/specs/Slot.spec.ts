module SpaceTac.Game.Specs {
    "use strict";

    describe("Slot", () => {
        it("checks equipment type", () => {
            var ship = new Ship();
            var slot = ship.addSlot(SlotType.Engine);

            var equipment = new Equipment();
            equipment.slot = SlotType.Weapon;

            expect(slot.attached).toBeNull();
            slot.attach(equipment);
            expect(slot.attached).toBeNull();

            equipment.slot = SlotType.Engine;

            slot.attach(equipment);
            expect(slot.attached).toBe(equipment);
        });

        it("checks equipment capabilities", () => {
            var ship = new Ship();
            var slot = ship.addSlot(SlotType.Shield);

            var equipment = new Equipment();
            equipment.slot = SlotType.Shield;
            equipment.requirements.push(new Attribute(AttributeCode.Cap_Gravity, 5));

            expect(slot.attached).toBeNull();
            slot.attach(equipment);
            expect(slot.attached).toBeNull();

            ship.cap_gravity.set(6);

            slot.attach(equipment);
            expect(slot.attached).toBe(equipment);
        });
    });
}
