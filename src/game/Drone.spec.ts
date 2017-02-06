/// <reference path="effects/BaseEffect.ts" />

module TS.SpaceTac.Game {
    /**
     * Fake effect to capture apply requests
     */
    class FakeEffect extends BaseEffect {
        applied: Ship[] = []

        constructor() {
            super("fake");
        }

        applyOnShip(ship: Ship): boolean {
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
        it("applies effects on deployment", function () {
            let ship1 = new Ship(null, "ship1");
            ship1.setArenaPosition(0, 0);
            let ship2 = new Ship(null, "ship2");
            ship2.setArenaPosition(5, 5);
            let ship3 = new Ship(null, "ship3");
            ship3.setArenaPosition(10, 10);
            let [drone, effect] = newTestDrone(2, 2, 8, ship1);

            expect(effect.getApplyCalls()).toEqual([]);

            drone.onDeploy([ship1, ship2, ship3]);
            expect(effect.getApplyCalls()).toEqual([ship1, ship2]);
        });

        it("applies effects on ships entering the radius", function () {
            let owner = new Ship(null, "owner");
            let target = new Ship(null, "target");
            target.setArenaPosition(10, 10);
            let [drone, effect] = newTestDrone(0, 0, 5, owner);

            expect(effect.getApplyCalls()).toEqual([], "initial");

            drone.onTurnStart(target);
            expect(effect.getApplyCalls()).toEqual([], "turn start");

            target.setArenaPosition(2, 3);
            drone.onShipMove(target);
            expect(effect.getApplyCalls()).toEqual([target], "enter");

            target.setArenaPosition(1, 1);
            drone.onShipMove(target);
            expect(effect.getApplyCalls()).toEqual([], "move inside");

            target.setArenaPosition(12, 12);
            drone.onShipMove(target);
            expect(effect.getApplyCalls()).toEqual([], "exit");

            target.setArenaPosition(1, 1);
            drone.onShipMove(target);
            expect(effect.getApplyCalls()).toEqual([target], "re-enter");
        });

        it("applies effects on ships remaining in the radius", function () {
            let owner = new Ship(null, "owner");
            let target = new Ship(null, "target");
            let [drone, effect] = newTestDrone(0, 0, 5, owner);

            target.setArenaPosition(1, 2);
            drone.onTurnStart(target);
            expect(effect.getApplyCalls()).toEqual([], "start inside");

            target.setArenaPosition(2, 2);
            drone.onShipMove(target);
            expect(effect.getApplyCalls()).toEqual([], "move inside");

            drone.onTurnEnd(target);
            expect(effect.getApplyCalls()).toEqual([target], "turn end");

            drone.onTurnStart(target);
            expect(effect.getApplyCalls()).toEqual([], "second turn start");

            target.setArenaPosition(12, 12);
            drone.onShipMove(target);
            expect(effect.getApplyCalls()).toEqual([], "move out");

            drone.onTurnEnd(target);
            expect(effect.getApplyCalls()).toEqual([], "second turn end");
        });

        it("signals the need for destruction after its lifetime", function () {
            let owner = new Ship(null, "owner");
            let other = new Ship(null, "other");
            let [drone, effect] = newTestDrone(0, 0, 5, owner);
            drone.duration = 2;

            let result = drone.onTurnStart(other);
            expect(result).toBe(true);
            result = drone.onTurnStart(owner);
            expect(result).toBe(true);
            result = drone.onTurnStart(other);
            expect(result).toBe(true);
            result = drone.onTurnStart(owner);
            expect(result).toBe(false);
        });
    });
}
