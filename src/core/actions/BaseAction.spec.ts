module TK.SpaceTac.Specs {
    testing("BaseAction", test => {
        test.case("may be applied and reverted", check => {
            let battle = TestTools.createBattle();
            let ship = nn(battle.playing_ship);
            TestTools.setShipModel(ship, 100, 0, 10);
            let action = TestTools.addWeapon(ship, 0, 3, 100, 50);
            action.configureCooldown(2, 1);

            TestTools.actionChain(check, battle, [
                [ship, action, Target.newFromLocation(0, 0)],
                [ship, action, Target.newFromLocation(0, 0)],
                [ship, EndTurnAction.SINGLETON, undefined],
            ], [
                    check => {
                        check.equals(ship.getValue("power"), 10, "power");
                        let cooldown = ship.actions.getCooldown(action);
                        check.equals(cooldown.uses, 0, "uses");
                        check.equals(cooldown.heat, 0, "heat");
                    },
                    check => {
                        check.equals(ship.getValue("power"), 7, "power");
                        let cooldown = ship.actions.getCooldown(action);
                        check.equals(cooldown.uses, 1, "uses");
                        check.equals(cooldown.heat, 0, "heat");
                    },
                    check => {
                        check.equals(ship.getValue("power"), 4, "power");
                        let cooldown = ship.actions.getCooldown(action);
                        check.equals(cooldown.uses, 2, "uses");
                        check.equals(cooldown.heat, 1, "heat");
                    },
                    check => {
                        check.equals(ship.getValue("power"), 10, "power");
                        let cooldown = ship.actions.getCooldown(action);
                        check.equals(cooldown.uses, 0, "uses");
                        check.equals(cooldown.heat, 0, "heat");
                    },
                ]);
        })

        test.case("checks against remaining power", check => {
            let action = new BaseAction("test");
            check.patch(action, "getPowerUsage", () => 3);

            let ship = new Ship();
            check.equals(action.checkCannotBeApplied(ship), "action not available");

            ship.actions.addCustom(action);
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

        test.case("checks against overheat", check => {
            let action = new BaseAction("test");
            let ship = new Ship();
            ship.actions.addCustom(action);
            let cooldown = ship.actions.getCooldown(action);

            check.equals(action.checkCannotBeApplied(ship), null);

            cooldown.use();
            check.equals(action.checkCannotBeApplied(ship), null);

            cooldown.configure(2, 3);
            check.equals(action.checkCannotBeApplied(ship), null);

            cooldown.use();
            check.equals(action.checkCannotBeApplied(ship), null);

            cooldown.use();
            check.equals(action.checkCannotBeApplied(ship), "overheated");

            cooldown.cool();
            check.equals(action.checkCannotBeApplied(ship), "overheated");

            cooldown.cool();
            check.equals(action.checkCannotBeApplied(ship), "overheated");

            cooldown.cool();
            check.equals(action.checkCannotBeApplied(ship), null);
        })

        test.case("helps applying a targetting filter", check => {
            let fleet1 = new Fleet();
            let fleet2 = new Fleet();
            let ship1a = fleet1.addShip();
            let ship1b = fleet1.addShip();
            let ship2a = fleet2.addShip();
            let ship2b = fleet2.addShip();
            let ships = [ship1a, ship1b, ship2a, ship2b];

            check.equals(BaseAction.filterTargets(ship1a, ships, ActionTargettingFilter.ALL),
                [ship1a, ship1b, ship2a, ship2b], "ALL");
            check.equals(BaseAction.filterTargets(ship1a, ships, ActionTargettingFilter.ALL_BUT_SELF),
                [ship1b, ship2a, ship2b], "ALL_BUT_SELF");
            check.equals(BaseAction.filterTargets(ship1a, ships, ActionTargettingFilter.ALLIES),
                [ship1a, ship1b], "ALLIES");
            check.equals(BaseAction.filterTargets(ship1a, ships, ActionTargettingFilter.ALLIES_BUT_SELF),
                [ship1b], "ALLIES_BUT_SELF");
            check.equals(BaseAction.filterTargets(ship1a, ships, ActionTargettingFilter.ENEMIES),
                [ship2a, ship2b], "ENEMIES");
        });
    });
}
