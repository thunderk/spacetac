/// <reference path="effects/BaseEffect.ts" />

module TK.SpaceTac {
    /**
     * Fake effect to capture apply requests
     */
    class FakeEffect extends BaseEffect {
        applied: Ship[] = []

        constructor() {
            super("fake");
        }

        getOnDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            this.applied.push(ship);
            return [];
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
        let battle = owner.getBattle();
        if (battle) {
            battle.addDrone(drone);
        }
        return [drone, effect];
    }

    testing("Drone", test => {
        test.case("applies effects on all ships inside the radius", check => {
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

            check.equals(effect.getApplyCalls(), []);

            drone.activate(battle);
            check.equals(effect.getApplyCalls(), [ship1, ship2]);
        });

        test.case("signals the need for destruction after its lifetime", check => {
            let battle = new Battle();
            let owner = new Ship(battle.fleets[0]);
            let [drone, effect] = newTestDrone(0, 0, 5, owner);
            drone.duration = 3;

            let removeDrone = check.patch(battle, "removeDrone", null);

            drone.activate(battle);
            check.equals(drone.duration, 2);
            check.called(removeDrone, 0);

            drone.activate(battle);
            check.equals(drone.duration, 1);
            check.called(removeDrone, 0);

            drone.activate(battle);
            check.equals(drone.duration, 0);
            check.called(removeDrone, [[drone]]);
        });

        test.case("builds diffs on activation", check => {
            let battle = new Battle();
            let ship = new Ship();
            ship.fleet.setBattle(battle);
            let other = new Ship();
            let drone = new Drone(ship);

            drone.duration = 2;
            check.in("duration=2", check => {
                check.equals(drone.getDiffs(battle, [ship, other]), [
                    new DroneAppliedDiff(drone, [ship, other]),
                ], "two ships in range");
                check.equals(drone.getDiffs(battle, []), [
                ], "no ship in range");
            });

            drone.duration = 1;
            check.in("duration=1", check => {
                check.equals(drone.getDiffs(battle, [ship, other]), [
                    new DroneAppliedDiff(drone, [ship, other]),
                    new DroneDestroyedDiff(drone),
                ], "two ships in range");
                check.equals(drone.getDiffs(battle, []), [
                    new DroneDestroyedDiff(drone),
                ], "no ship in range");
            });

            drone.duration = 0;
            check.in("duration=0", check => {
                check.equals(drone.getDiffs(battle, [ship, other]), [
                    new DroneDestroyedDiff(drone),
                ], "two ships in range");
                check.equals(drone.getDiffs(battle, []), [
                    new DroneDestroyedDiff(drone),
                ], "no ship in range");
            });
        });

        test.case("builds a textual description", check => {
            let drone = new Drone(new Ship());
            drone.duration = 1;
            check.equals(drone.getDescription(), "For 1 activation:\n• do nothing");

            drone.duration = 3;
            drone.effects = [
                new DamageEffect(5),
                new AttributeEffect("skill_quantum", 1)
            ]
            check.equals(drone.getDescription(), "For 3 activations:\n• do 5 damage\n• quantum skill +1");
        });
    });
}
