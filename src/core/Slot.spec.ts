module TK.SpaceTac.Specs {
    testing("Slot", test => {
        test.case("checks equipment type", check => {
            check.patch(console, "warn", null);

            var ship = new Ship();
            var slot = ship.addSlot(SlotType.Engine);

            var equipment = new Equipment();
            equipment.slot_type = SlotType.Weapon;

            check.equals(slot.attached, null);
            slot.attach(equipment);
            check.equals(slot.attached, null);

            equipment.slot_type = SlotType.Engine;

            slot.attach(equipment);
            check.same(slot.attached, equipment);
        });

        test.case("checks equipment capabilities", check => {
            check.patch(console, "warn", null);

            var ship = new Ship();
            var slot = ship.addSlot(SlotType.Shield);

            var equipment = new Equipment();
            equipment.slot_type = SlotType.Shield;
            equipment.requirements["skill_gravity"] = 5;

            check.equals(slot.attached, null);
            slot.attach(equipment);
            check.equals(slot.attached, null);

            TestTools.setAttribute(ship, "skill_gravity", 6);

            slot.attach(equipment);
            check.same(slot.attached, equipment);
        });
    });
}
