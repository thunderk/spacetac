module TK.SpaceTac.Specs {
    testing("DroneDeployedDiff", test => {
        test.case("applies and reverts", check => {
            let battle = TestTools.createBattle();
            let drone1 = new Drone(battle.play_order[0]);
            let drone2 = new Drone(battle.play_order[0], "test");

            TestTools.diffChain(check, battle, [
                new DroneDeployedDiff(drone1),
                new DroneDeployedDiff(drone2),
                new DroneRecalledDiff(drone1),
                new DroneRecalledDiff(drone2),
            ], [
                    check => {
                        check.equals(battle.drones.count(), 0, "drone count");
                    },
                    check => {
                        check.equals(battle.drones.count(), 1, "drone count");
                    },
                    check => {
                        check.equals(battle.drones.count(), 2, "drone count");
                    },
                    check => {
                        check.equals(battle.drones.count(), 1, "drone count");
                    },
                    check => {
                        check.equals(battle.drones.count(), 0, "drone count");
                    },
                ]);
        });
    });
}