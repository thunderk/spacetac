module TK.SpaceTac {
    describe("BaseAction", function () {
        it("check if equipment can be used with remaining AP", function () {
            var equipment = new Equipment(SlotType.Hull);
            var action = new BaseAction("test", "Test", equipment);
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
        })

        it("check if equipment can be used with overheat", function () {
            let equipment = new Equipment();
            let action = new BaseAction("test", "Test", equipment);
            let ship = new Ship();

            expect(action.checkCannotBeApplied(ship)).toBe(null);
            expect(action.getUsesBeforeOverheat()).toBe(Infinity);

            equipment.cooldown.use();
            expect(action.checkCannotBeApplied(ship)).toBe(null);
            expect(action.getUsesBeforeOverheat()).toBe(Infinity);

            equipment.cooldown.configure(2, 3);
            expect(action.checkCannotBeApplied(ship)).toBe(null);
            expect(action.getUsesBeforeOverheat()).toBe(2);

            equipment.cooldown.use();
            expect(action.checkCannotBeApplied(ship)).toBe(null);
            expect(action.getUsesBeforeOverheat()).toBe(1);
            expect(action.getCooldownDuration()).toBe(0);

            equipment.cooldown.use();
            expect(action.checkCannotBeApplied(ship)).toBe("overheated");
            expect(action.getUsesBeforeOverheat()).toBe(0);
            expect(action.getCooldownDuration()).toBe(3);

            equipment.cooldown.cool();
            expect(action.checkCannotBeApplied(ship)).toBe("overheated");
            expect(action.getCooldownDuration()).toBe(2);

            equipment.cooldown.cool();
            expect(action.checkCannotBeApplied(ship)).toBe("overheated");
            expect(action.getCooldownDuration()).toBe(1);

            equipment.cooldown.cool();
            expect(action.checkCannotBeApplied(ship)).toBe(null);
            expect(action.getCooldownDuration()).toBe(0);
            expect(action.getCooldownDuration(true)).toBe(3);
        })

        it("wears down equipment and power generators", function () {
            let ship = new Ship();
            TestTools.setShipAP(ship, 10);
            let power = ship.listEquipment(SlotType.Power)[0];
            let equipment = new Equipment(SlotType.Weapon);
            let action = new BaseAction("test", "Test", equipment);

            spyOn(action, "checkTarget").and.callFake((ship: Ship, target: Target) => target);

            expect(power.wear).toBe(0);
            expect(equipment.wear).toBe(0);
            action.apply(ship);

            expect(power.wear).toBe(1);
            expect(equipment.wear).toBe(1);
        })

        it("guesses targetting mode", function () {
            let ship = new Ship();
            let action = new BaseAction("test", "Test");
            expect(action.getTargettingMode(ship)).toEqual(ActionTargettingMode.SELF_CONFIRM);

            action = new BaseAction("test", "Test");
            spyOn(action, "getRangeRadius").and.returnValue(50);
            expect(action.getTargettingMode(ship)).toEqual(ActionTargettingMode.SHIP);

            action = new BaseAction("test", "Test");
            spyOn(action, "getRangeRadius").and.returnValue(50);
            spyOn(action, "getBlastRadius").and.returnValue(20);
            expect(action.getTargettingMode(ship)).toEqual(ActionTargettingMode.SPACE);

            action = new BaseAction("test", "Test");
            spyOn(action, "getBlastRadius").and.returnValue(20);
            expect(action.getTargettingMode(ship)).toEqual(ActionTargettingMode.SURROUNDINGS);
        })
    });
}
