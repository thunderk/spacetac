/// <reference path="../effects/BaseEffect.ts" />

module TS.SpaceTac {
    describe("DeployDroneAction", function () {
        it("stores useful information", function () {
            let equipment = new Equipment(SlotType.Weapon, "testdrone");
            let action = new DeployDroneAction(equipment);

            expect(action.code).toEqual("deploy-testdrone");
            expect(action.name).toEqual("Deploy");
            expect(action.equipment).toBe(equipment);
        });

        it("allows to deploy in range", function () {
            let ship = new Ship();
            ship.setArenaPosition(0, 0);
            let action = new DeployDroneAction(new Equipment(), 0, 8);

            expect(action.checkTarget(ship, new Target(8, 0, null))).toEqual(new Target(8, 0, null));
            expect(action.checkTarget(ship, new Target(12, 0, null))).toEqual(new Target(8, 0, null));

            let other = new Ship();
            other.setArenaPosition(8, 0);
            expect(action.checkTarget(ship, new Target(8, 0, other))).toBeNull();
        });

        it("deploys a new drone", function () {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            ship.setArenaPosition(0, 0);
            battle.playing_ship = ship;
            TestTools.setShipAP(ship, 3);
            let equipment = new Equipment(SlotType.Weapon, "testdrone");
            let action = new DeployDroneAction(equipment, 2, 8, 2, 4, [new DamageEffect(50)]);

            battle.log.clear();
            battle.log.addFilter("value");
            let result = action.apply(ship, new Target(5, 0, null));

            expect(result).toBe(true);
            expect(battle.drones.length).toBe(1);

            let drone = battle.drones[0];
            expect(drone.code).toEqual("testdrone");
            expect(drone.duration).toEqual(2);
            expect(drone.owner).toBe(ship);
            expect(drone.x).toEqual(5);
            expect(drone.y).toEqual(0);
            expect(drone.radius).toEqual(4);
            expect(drone.effects).toEqual([new DamageEffect(50)]);
            expect(battle.log.events).toEqual([
                new ActionAppliedEvent(ship, action, Target.newFromLocation(5, 0), 2),
                new DroneDeployedEvent(drone)
            ]);

            expect(ship.values.power.get()).toEqual(1);
        });
    });
}
