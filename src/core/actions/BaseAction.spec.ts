module TK.SpaceTac.Specs {
    testing("BaseAction", test => {
        test.case("may be applied and reverted", check => {
            let battle = TestTools.createBattle();
            let ship = nn(battle.playing_ship);
            TestTools.setShipAP(ship, 10, 4);
            let equipment = TestTools.addWeapon(ship, 0, 3, 100, 50);
            let action = nn(equipment.action);
            action.cooldown.configure(2, 1);

            TestTools.actionChain(check, battle, [
                [ship, action, Target.newFromLocation(0, 0)],
                [ship, action, Target.newFromLocation(0, 0)],
                [ship, EndTurnAction.SINGLETON, undefined],
            ], [
                    check => {
                        check.equals(ship.getValue("power"), 10, "power");
                        check.equals(action.cooldown.uses, 0, "uses");
                        check.equals(action.cooldown.heat, 0, "heat");
                    },
                    check => {
                        check.equals(ship.getValue("power"), 7, "power");
                        check.equals(action.cooldown.uses, 1, "uses");
                        check.equals(action.cooldown.heat, 0, "heat");
                    },
                    check => {
                        check.equals(ship.getValue("power"), 4, "power");
                        check.equals(action.cooldown.uses, 2, "uses");
                        check.equals(action.cooldown.heat, 1, "heat");
                    },
                    check => {
                        check.equals(ship.getValue("power"), 8, "power");
                        check.equals(action.cooldown.uses, 0, "uses");
                        check.equals(action.cooldown.heat, 0, "heat");
                    },
                ]);
        })

        test.case("checks if equipment can be used with remaining AP", check => {
            var equipment = new Equipment(SlotType.Hull);
            var action = new BaseAction("test", equipment);
            check.patch(action, "getActionPointsUsage", () => 3);
            var ship = new Ship();
            ship.addSlot(SlotType.Hull).attach(equipment);

            check.equals(action.checkCannotBeApplied(ship), "not enough power");

            ship.setValue("power", 5);

            check.equals(action.checkCannotBeApplied(ship), null);
            check.equals(action.checkCannotBeApplied(ship, 4), null);
            check.equals(action.checkCannotBeApplied(ship, 3), null);
            check.equals(action.checkCannotBeApplied(ship, 2), "not enough power");

            ship.setValue("power", 3);

            check.equals(action.checkCannotBeApplied(ship), null);

            ship.setValue("power", 2);

            check.equals(action.checkCannotBeApplied(ship), "not enough power");
        })

        test.case("checks if equipment can be used with overheat", check => {
            let equipment = new Equipment();
            let action = new BaseAction("test", equipment);
            let ship = new Ship();

            check.equals(action.checkCannotBeApplied(ship), null);
            check.same(action.getUsesBeforeOverheat(), Infinity);

            equipment.cooldown.use();
            check.equals(action.checkCannotBeApplied(ship), null);
            check.same(action.getUsesBeforeOverheat(), Infinity);

            equipment.cooldown.configure(2, 3);
            check.equals(action.checkCannotBeApplied(ship), null);
            check.equals(action.getUsesBeforeOverheat(), 2);

            equipment.cooldown.use();
            check.equals(action.checkCannotBeApplied(ship), null);
            check.equals(action.getUsesBeforeOverheat(), 1);
            check.equals(action.getCooldownDuration(), 0);

            equipment.cooldown.use();
            check.equals(action.checkCannotBeApplied(ship), "overheated");
            check.equals(action.getUsesBeforeOverheat(), 0);
            check.equals(action.getCooldownDuration(), 3);

            equipment.cooldown.cool();
            check.equals(action.checkCannotBeApplied(ship), "overheated");
            check.equals(action.getCooldownDuration(), 2);

            equipment.cooldown.cool();
            check.equals(action.checkCannotBeApplied(ship), "overheated");
            check.equals(action.getCooldownDuration(), 1);

            equipment.cooldown.cool();
            check.equals(action.checkCannotBeApplied(ship), null);
            check.equals(action.getCooldownDuration(), 0);
            check.equals(action.getCooldownDuration(true), 3);
        })

        test.case("wears down equipment and power generators", check => {
            let battle = TestTools.createBattle();
            let ship = battle.play_order[0];
            TestTools.setShipAP(ship, 10);
            let power = ship.listEquipment(SlotType.Power)[0];
            let equipment = new Equipment(SlotType.Weapon);
            let action = new BaseAction("test", equipment);
            equipment.action = action;
            ship.addSlot(SlotType.Weapon).attach(equipment);

            check.patch(action, "checkTarget", (ship: Ship, target: Target) => target);

            check.equals(power.wear, 0, "power wear");
            check.equals(equipment.wear, 0, "equipment wear");
            action.apply(battle, ship);

            check.equals(power.wear, 1, "power wear");
            check.equals(equipment.wear, 1, "equipment wear");
        })
    });
}
