module TS.SpaceTac {
    describe("BaseAction", function () {
        it("check if equipment can be used with remaining AP", function () {
            var equipment = new Equipment(SlotType.Hull);
            equipment.ap_usage = 3;
            var action = new BaseAction("test", "Test", false, equipment);
            var ship = new Ship();
            ship.addSlot(SlotType.Hull).attach(equipment);
            ship.values.power.setMaximal(10);

            expect(action.checkCannotBeApplied(ship)).toBe("not enough power");

            ship.values.power.set(5);

            expect(action.checkCannotBeApplied(ship)).toBe(null);
            expect(action.checkCannotBeApplied(ship, 4)).toBe(null);
            expect(action.checkCannotBeApplied(ship, 3)).toBe(null);
            expect(action.checkCannotBeApplied(ship, 2)).toBe("not enough power");

            ship.values.power.set(3);

            expect(action.checkCannotBeApplied(ship)).toBe(null);

            ship.values.power.set(2);

            expect(action.checkCannotBeApplied(ship)).toBe("not enough power");
        });
    });
}
