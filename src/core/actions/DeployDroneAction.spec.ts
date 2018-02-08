module TK.SpaceTac.Specs {
    testing("DeployDroneAction", test => {
        test.case("stores useful information", check => {
            let ship = new Ship();
            let action = new DeployDroneAction("testdrone");
            ship.actions.addCustom(action);

            check.equals(action.code, "testdrone");
            check.equals(action.getVerb(ship), "Deploy");

            ship.actions.toggle(action, true);
            check.equals(action.getVerb(ship), "Recall");
        });

        test.case("allows to deploy in range", check => {
            let ship = new Ship();
            ship.setArenaPosition(0, 0);
            let action = new DeployDroneAction("testdrone", { power: 0 }, { deploy_distance: 8 });
            ship.actions.addCustom(action);

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
            TestTools.setShipModel(ship, 100, 0, 3);

            let action = new DeployDroneAction("testdrone", { power: 2 }, { deploy_distance: 8, drone_radius: 4, drone_effects: [new DamageEffect(50)] });
            ship.actions.addCustom(action);

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
