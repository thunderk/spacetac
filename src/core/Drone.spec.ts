/// <reference path="effects/BaseEffect.ts" />

module TK.SpaceTac {
    testing("Drone", test => {
        test.case("applies area effects when deployed", check => {
            let battle = TestTools.createBattle();
            let ship = nn(battle.playing_ship);
            TestTools.setShipAP(ship, 10);
            let weapon = TestTools.addWeapon(ship);
            weapon.action = new DeployDroneAction(weapon, 2, 300, 30, [new AttributeEffect("precision", 15)]);
            let engine = TestTools.addEngine(ship, 1000);

            TestTools.actionChain(check, battle, [
                [ship, nn(weapon.action), Target.newFromLocation(150, 50)],  // deploy out of effects radius
                [ship, nn(engine.action), Target.newFromLocation(110, 50)],  // move out of effects radius
                [ship, nn(engine.action), Target.newFromLocation(130, 50)],  // move in effects radius
                [ship, nn(weapon.action), Target.newFromShip(ship)],  // recall
                [ship, nn(weapon.action), Target.newFromLocation(130, 70)],  // deploy in effects radius
            ], [
                    check => {
                        check.equals(ship.active_effects.count(), 0, "active effects");
                        check.equals(ship.getValue("power"), 10, "power");
                        check.equals(battle.drones.count(), 0, "drone count");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 0, "active effects");
                        check.equals(ship.getValue("power"), 8, "power");
                        check.equals(battle.drones.count(), 1, "drone count");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 0, "active effects");
                        check.equals(ship.getValue("power"), 7, "power");
                        check.equals(battle.drones.count(), 1, "drone count");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 1, "active effects");
                        check.equals(ship.getValue("power"), 6, "power");
                        check.equals(battle.drones.count(), 1, "drone count");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 0, "active effects");
                        check.equals(ship.getValue("power"), 8, "power");
                        check.equals(battle.drones.count(), 0, "drone count");
                    },
                    check => {
                        check.equals(ship.active_effects.count(), 1, "active effects");
                        check.equals(ship.getValue("power"), 6, "power");
                        check.equals(battle.drones.count(), 1, "drone count");
                    },
                ]);
        });

        test.case("builds a textual description", check => {
            let drone = new Drone(new Ship());
            check.equals(drone.getDescription(), "While deployed:\n• do nothing");

            drone.effects = [
                new DamageEffect(5),
                new AttributeEffect("skill_quantum", 1)
            ]
            check.equals(drone.getDescription(), "While deployed:\n• do 5 damage\n• quantum skill +1");
        });
    });
}
