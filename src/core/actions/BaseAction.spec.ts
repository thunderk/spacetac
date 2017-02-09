module TS.SpaceTac {
    describe("BaseAction", function () {
        it("check if equipment can be used with remaining AP", function () {
            var equipment = new Equipment(SlotType.Armor);
            equipment.ap_usage = 3;
            var action = new BaseAction("test", "Test", false, equipment);
            var ship = new Ship();
            ship.addSlot(SlotType.Armor).attach(equipment);
            ship.values.power.setMaximal(10);

            expect(action.canBeUsed(null, ship)).toBe(false);

            ship.values.power.set(5);

            expect(action.canBeUsed(null, ship)).toBe(true);
            expect(action.canBeUsed(null, ship, 4)).toBe(true);
            expect(action.canBeUsed(null, ship, 3)).toBe(true);
            expect(action.canBeUsed(null, ship, 2)).toBe(false);

            ship.values.power.set(3);

            expect(action.canBeUsed(null, ship)).toBe(true);

            ship.values.power.set(2);

            expect(action.canBeUsed(null, ship)).toBe(false);
        });
    });
}
