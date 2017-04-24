module TS.SpaceTac {
    describe("BaseAction", function () {
        it("check if equipment can be used with remaining AP", function () {
            var equipment = new Equipment(SlotType.Hull);
            var action = new BaseAction("test", "Test", false, equipment);
            spyOn(action, "getActionPointsUsage").and.returnValue(3);
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

        it("wears down equipment and power generators", function () {
            let ship = new Ship();
            TestTools.setShipAP(ship, 10);
            let power = ship.listEquipment(SlotType.Power)[0];
            let equipment = new Equipment(SlotType.Weapon);
            let action = new BaseAction("test", "Test", false, equipment);

            expect(power.wear).toBe(0);
            expect(equipment.wear).toBe(0);
            action.apply(ship, null);

            expect(power.wear).toBe(1);
            expect(equipment.wear).toBe(1);
        });
    });
}
