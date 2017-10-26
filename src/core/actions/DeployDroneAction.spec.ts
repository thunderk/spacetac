module TK.SpaceTac {
    testing("DeployDroneAction", test => {
        test.case("stores useful information", check => {
            let equipment = new Equipment(SlotType.Weapon, "testdrone");
            let action = new DeployDroneAction(equipment);

            check.equals(action.code, "deploy-testdrone");
            check.equals(action.name, "Deploy");
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
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            ship.setArenaPosition(0, 0);
            TestTools.setShipPlaying(battle, ship);
            TestTools.setShipAP(ship, 3);
            let equipment = new Equipment(SlotType.Weapon, "testdrone");
            let action = new DeployDroneAction(equipment, 2, 8, 2, 4, [new DamageEffect(50)]);

            battle.log.clear();
            battle.log.addFilter("value");
            let result = action.apply(ship, new Target(5, 0, null));

            check.equals(result, true);
            check.equals(battle.drones.length, 1);

            let drone = battle.drones[0];
            check.equals(drone.code, "testdrone");
            check.equals(drone.duration, 2);
            check.same(drone.owner, ship);
            check.equals(drone.x, 5);
            check.equals(drone.y, 0);
            check.equals(drone.radius, 4);
            check.equals(drone.effects, [new DamageEffect(50)]);
            check.equals(battle.log.events, [
                new ActionAppliedEvent(ship, action, Target.newFromLocation(5, 0), 2),
                new DroneDeployedEvent(drone)
            ]);

            check.equals(ship.values.power.get(), 1);
        });
    });
}
