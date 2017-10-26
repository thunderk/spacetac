module TK.SpaceTac.Specs {
    testing("ShipGenerator", test => {
        test.case("can use ship model", check => {
            var gen = new ShipGenerator();
            var model = new ShipModel("test", "Test", 1, 2, true, 3);
            var ship = gen.generate(1, model);
            check.same(ship.model, model);
            check.equals(ship.cargo_space, 2);
            check.equals(ship.slots.length, 7);
            check.same(ship.slots[0].type, SlotType.Hull);
            check.same(ship.slots[1].type, SlotType.Shield);
            check.same(ship.slots[2].type, SlotType.Power);
            check.same(ship.slots[3].type, SlotType.Engine);
            check.same(ship.slots[4].type, SlotType.Weapon);
            check.same(ship.slots[5].type, SlotType.Weapon);
            check.same(ship.slots[6].type, SlotType.Weapon);
            check.equals(ship.getAttribute("skill_materials"), 1);
        });
    });
}
