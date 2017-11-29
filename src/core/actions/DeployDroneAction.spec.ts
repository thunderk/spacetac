module TK.SpaceTac.Specs {
    testing("DeployDroneAction", test => {
        test.case("stores useful information", check => {
            let equipment = new Equipment(SlotType.Weapon, "testdrone");
            let action = new DeployDroneAction(equipment);

            check.equals(action.code, "deploy-testdrone");
            check.equals(action.getVerb(), "Deploy");
            check.same(action.equipment, equipment);
        });

        test.case("allows to deploy in range", check => {
            let ship = new Ship();
            ship.setArenaPosition(0, 0);
            let action = new DeployDroneAction(new Equipment(), 0, 8);

            check.equals(action.checkTarget(ship, new Target(8, 0, null)), new Target(8, 0, null));
            check.equals(action.checkTarget(ship, new Target(12, 0, null)), new Target(8, 0, null));

            let other = new Ship();
            other.setArenaPosition(8, 0);
            check.equals(action.checkTarget(ship, new Target(8, 0, other)), null);
        });

        test.case("deploys a new drone", check => {
            let battle = TestTools.createBattle();
            let ship = battle.play_order[0];
            ship.setArenaPosition(0, 0);
            TestTools.setShipAP(ship, 3);

            let equipment = new Equipment(SlotType.Weapon, "testdrone");
            let action = new DeployDroneAction(equipment, 2, 8, 4, [new DamageEffect(50)]);
            equipment.action = action;
            ship.addSlot(SlotType.Weapon).attach(equipment);

            TestTools.actionChain(check, battle, [
                [ship, action, new Target(5, 0)],
            ], [
                    check => {
                        check.equals(ship.getValue("power"), 3, "power=3");
                        check.equals(battle.drones.count(), 0, "drones=0");
                    },
                    check => {
                        check.equals(ship.getValue("power"), 1, "power=1");
                        check.equals(battle.drones.count(), 1, "drones=1");

                        let drone = battle.drones.list()[0];
                        check.equals(drone.code, "testdrone");
                        check.same(drone.owner, ship.id);
                        check.equals(drone.x, 5);
                        check.equals(drone.y, 0);
                        check.equals(drone.radius, 4);
                        compare_effects(check, drone.effects, [new DamageEffect(50)]);
                    }
                ])
        });
    });
}
