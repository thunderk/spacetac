/// <reference path="effects/BaseEffect.ts" />

module TS.SpaceTac {
    /**
     * Fake effect to capture apply requests
     */
    class FakeEffect extends BaseEffect {
        applied: Ship[] = []

        constructor() {
            super("fake");
        }

        applyOnShip(ship: Ship, source: Ship | Drone): boolean {
            this.applied.push(ship);
            return true;
        }

        getApplyCalls() {
            let result = acopy(this.applied);
            this.applied = [];
            return result;
        }
    }

    function newTestDrone(x: number, y: number, radius: number, owner: Ship): [Drone, FakeEffect] {
        let drone = new Drone(owner);
        drone.x = x;
        drone.y = y;
        drone.radius = radius;
        let effect = new FakeEffect();
        drone.effects.push(effect);
        return [drone, effect];
    }

    describe("Drone", function () {
        it("applies effects on all ships inside the radius", function () {
            let battle = new Battle();
            let ship1 = new Ship(battle.fleets[0], "ship1");
            ship1.setArenaPosition(0, 0);
            let ship2 = new Ship(battle.fleets[0], "ship2");
            ship2.setArenaPosition(5, 5);
            let ship3 = new Ship(battle.fleets[0], "ship3");
            ship3.setArenaPosition(10, 10);
            let ship4 = new Ship(battle.fleets[0], "ship4");
            ship4.setArenaPosition(0, 0);
            ship4.setDead();
            let [drone, effect] = newTestDrone(2, 2, 8, ship1);

            expect(effect.getApplyCalls()).toEqual([]);

            drone.activate();
            expect(effect.getApplyCalls()).toEqual([ship1, ship2]);
        });

        it("signals the need for destruction after its lifetime", function () {
            let battle = new Battle();
            let owner = new Ship(battle.fleets[0]);
            let [drone, effect] = newTestDrone(0, 0, 5, owner);
            drone.duration = 3;

            let removeDrone = spyOn(battle, "removeDrone").and.callThrough();

            drone.activate();
            expect(removeDrone).not.toHaveBeenCalled();
            drone.activate();
            expect(removeDrone).not.toHaveBeenCalled();
            drone.activate();
            expect(removeDrone).toHaveBeenCalledWith(drone, true);
        });

        it("logs each activation", function () {
            let battle = new Battle();
            let ship = new Ship();
            ship.fleet.setBattle(battle);
            let other = new Ship();

            let drone = new Drone(ship);
            drone.apply([ship, other]);
            drone.apply([]);
            drone.apply([other]);

            expect(battle.log.events).toEqual([
                new DroneAppliedEvent(drone, [ship, other]),
                new DroneAppliedEvent(drone, [other])
            ]);
        });

        it("builds a textual description", function () {
            let drone = new Drone(new Ship());
            drone.duration = 1;
            expect(drone.getDescription()).toEqual("For 1 activation:\n• do nothing");

            drone.duration = 3;
            drone.effects = [
                new DamageEffect(5),
                new AttributeEffect("skill_quantum", 1)
            ]
            expect(drone.getDescription()).toEqual("For 3 activations:\n• do 5 damage\n• quantum skill +1");
        });
    });
}
