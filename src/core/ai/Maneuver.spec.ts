module TK.SpaceTac.Specs {
    testing("Maneuver", test => {
        test.case("guesses weapon effects", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[0].addShip();
            let ship3 = battle.fleets[1].addShip();
            let weapon = TestTools.addWeapon(ship1, 50, 0, 100, 10);
            ship1.setArenaPosition(0, 0);
            TestTools.setShipHP(ship1, 20, 20);
            ship2.setArenaPosition(0, 5);
            TestTools.setShipHP(ship2, 30, 30);
            ship3.setArenaPosition(0, 15);
            TestTools.setShipHP(ship3, 30, 30);
            let maneuver = new Maneuver(ship1, nn(weapon.action), Target.newFromLocation(0, 0));
            check.equals(maneuver.effects, [
                [ship1, new DamageEffect(50)],
                [ship2, new DamageEffect(50)]
            ]);
        });

        test.case("guesses drone effects", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[0].addShip();
            let ship3 = battle.fleets[1].addShip();
            let weapon = ship1.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            weapon.action = new DeployDroneAction(weapon, 0, 100, 1, 10, [new ValueEffect("shield", 10)]);
            ship1.setArenaPosition(0, 0);
            TestTools.setShipHP(ship1, 20, 20);
            ship2.setArenaPosition(0, 5);
            TestTools.setShipHP(ship2, 30, 30);
            ship3.setArenaPosition(0, 15);
            TestTools.setShipHP(ship3, 30, 30);
            let maneuver = new Maneuver(ship1, weapon.action, Target.newFromLocation(0, 0));
            check.equals(maneuver.effects, [
                [ship1, new ValueEffect("shield", 10)],
                [ship2, new ValueEffect("shield", 10)]
            ]);
        });

        test.case("guesses area effects on final location", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            let engine = TestTools.addEngine(ship, 500);
            let move = nn(engine.action);
            TestTools.setShipAP(ship, 10);
            let drone = new Drone(ship);
            drone.effects = [new AttributeEffect("maneuvrability", 1)];
            drone.x = 100;
            drone.y = 0;
            drone.radius = 50;
            battle.addDrone(drone);

            let maneuver = new Maneuver(ship, move, Target.newFromLocation(40, 30));
            check.containing(maneuver.getFinalLocation(), { x: 40, y: 30 });
            check.equals(maneuver.effects, []);

            maneuver = new Maneuver(ship, move, Target.newFromLocation(100, 30));
            check.containing(maneuver.getFinalLocation(), { x: 100, y: 30 });
            check.equals(maneuver.effects, [[ship, new AttributeEffect("maneuvrability", 1)]]);
        });
    });
}
