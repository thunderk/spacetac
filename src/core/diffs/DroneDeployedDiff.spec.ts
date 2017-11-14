module TK.SpaceTac.Specs {
    testing("DroneDeployedDiff", test => {
        test.case("applies and reverts", check => {
            let battle = TestTools.createBattle();
            let drone1 = new Drone(battle.play_order[0]);
            let drone2 = new Drone(battle.play_order[0], "test", 2);

            TestTools.diffChain(check, battle, [
                new DroneDeployedDiff(drone1, 3),
                new DroneDeployedDiff(drone2),
                new DroneAppliedDiff(drone1, []),
                new DroneAppliedDiff(drone1, []),
                new DroneDestroyedDiff(drone1, 1),
                new DroneDestroyedDiff(drone2),
            ], [
                    check => {
                        check.equals(battle.drones.count(), 0, "drone count");
                    },
                    check => {
                        check.equals(battle.drones.count(), 1, "drone count");
                        check.equals(nn(battle.drones.get(drone1.id)).duration, 3, "drone1 duration");
                    },
                    check => {
                        check.equals(battle.drones.count(), 2, "drone count");
                        check.equals(nn(battle.drones.get(drone1.id)).duration, 3, "drone1 duration");
                        check.equals(nn(battle.drones.get(drone2.id)).duration, 2, "drone2 duration");
                    },
                    check => {
                        check.equals(battle.drones.count(), 2, "drone count");
                        check.equals(nn(battle.drones.get(drone1.id)).duration, 2, "drone1 duration");
                        check.equals(nn(battle.drones.get(drone2.id)).duration, 2, "drone2 duration");
                    },
                    check => {
                        check.equals(battle.drones.count(), 2, "drone count");
                        check.equals(nn(battle.drones.get(drone1.id)).duration, 1, "drone1 duration");
                        check.equals(nn(battle.drones.get(drone2.id)).duration, 2, "drone2 duration");
                    },
                    check => {
                        check.equals(battle.drones.count(), 1, "drone count");
                        check.equals(nn(battle.drones.get(drone2.id)).duration, 2, "drone2 duration");
                    },
                    check => {
                        check.equals(battle.drones.count(), 0, "drone count");
                    },
                ]);
        });
    });
}