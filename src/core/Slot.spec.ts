module TK.SpaceTac.Specs {
    testing("Slot", test => {
        test.case("checks equipment type", check => {
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
            var ship = new Ship();
            var slot = ship.addSlot(SlotType.Shield);

            var equipment = new Equipment();
            equipment.slot_type = SlotType.Shield;
            equipment.requirements["skill_gravity"] = 5;

            check.equals(slot.attached, null);
            slot.attach(equipment);
            check.equals(slot.attached, null);

            ship.attributes.skill_gravity.set(6);

            slot.attach(equipment);
            check.same(slot.attached, equipment);
        });
    });
}
