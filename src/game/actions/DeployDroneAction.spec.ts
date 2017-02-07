/// <reference path="../effects/BaseEffect.ts" />

module TS.SpaceTac.Game {
    describe("DeployDroneAction", function () {
        it("stores useful information", function () {
            let equipment = new Equipment(SlotType.Weapon, "testdrone");
            let action = new DeployDroneAction(equipment);

            expect(action.code).toEqual("deploy-testdrone");
            expect(action.name).toEqual("Deploy");
            expect(action.equipment).toBe(equipment);
            expect(action.needs_target).toBe(true);
        });

        it("allows to deploy in range", function () {
            let ship = new Ship();
            ship.setArenaPosition(0, 0);
            let equipment = new Equipment();
            equipment.distance = 8;
            equipment.ap_usage = 0;
            let action = new DeployDroneAction(equipment);

            expect(action.checkTarget(null, ship, new Target(8, 0, null))).toEqual(new Target(8, 0, null));
            expect(action.checkTarget(null, ship, new Target(12, 0, null))).toEqual(new Target(8, 0, null));

            let other = new Ship();
            other.setArenaPosition(8, 0);
            expect(action.checkTarget(null, ship, new Target(8, 0, other))).toBeNull();
        });

        it("deploys a new drone", function () {
            let ship = new Ship();
            ship.setArenaPosition(0, 0);
            let battle = new Battle();
            battle.playing_ship = ship;
            TestTools.setShipAP(ship, 3);
            let equipment = new Equipment();
            equipment.distance = 8;
            equipment.ap_usage = 2;
            equipment.duration = 2;
            equipment.blast = 4;
            equipment.target_effects.push(new DamageEffect(50));
            let action = new DeployDroneAction(equipment);

            let result = action.apply(battle, ship, new Target(5, 0, null));

            expect(result).toBe(true);
            expect(battle.drones.length).toBe(1);

            let drone = battle.drones[0];
            expect(drone.duration).toEqual(2);
            expect(drone.owner).toBe(ship);
            expect(drone.x).toEqual(5);
            expect(drone.y).toEqual(0);
            expect(drone.radius).toEqual(4);
            expect(drone.effects).toEqual([new DamageEffect(50)]);
            expect(battle.log.events).toEqual([
                new DroneDeployedEvent(drone)
            ]);

            expect(ship.ap_current.current).toEqual(1);
        });
    });
}
