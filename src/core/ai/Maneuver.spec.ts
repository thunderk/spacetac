module TK.SpaceTac.Specs {
    testing("Maneuver", test => {
        test.case("uses move-fire simulation to build a list of battle diffs", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[1].addShip();
            let ship3 = battle.fleets[1].addShip();
            let ship4 = battle.fleets[1].addShip();
            let weapon = TestTools.addWeapon(ship1, 50, 2, 200, 100);
            let engine = TestTools.addEngine(ship1, 100);
            ship1.setArenaPosition(0, 0);
            TestTools.setShipHP(ship1, 20, 20);
            TestTools.setShipAP(ship1, 10);
            ship2.setArenaPosition(500, 0);
            TestTools.setShipHP(ship2, 70, 100);
            ship3.setArenaPosition(560, 0);
            TestTools.setShipHP(ship3, 80, 30);
            ship4.setArenaPosition(640, 0);
            TestTools.setShipHP(ship4, 30, 30);

            let maneuver = new Maneuver(ship1, nn(weapon.action), Target.newFromLocation(530, 0));
            check.contains(maneuver.effects, new ShipActionUsedDiff(ship1, nn(engine.action), Target.newFromLocation(331, 0)), "engine use");
            check.contains(maneuver.effects, new ShipValueDiff(ship1, "power", -4), "engine power");
            check.contains(maneuver.effects, new ShipMoveDiff(ship1, ship1.location, new ArenaLocationAngle(331, 0), engine), "move");
            check.contains(maneuver.effects, new ShipActionUsedDiff(ship1, nn(weapon.action), Target.newFromLocation(530, 0)), "weapon use");
            check.contains(maneuver.effects, new ProjectileFiredDiff(ship1, weapon, Target.newFromLocation(530, 0)), "weapon power");
            check.contains(maneuver.effects, new ShipValueDiff(ship1, "power", -2), "weapon power");
            check.contains(maneuver.effects, new ShipValueDiff(ship2, "shield", -50), "ship2 shield value");
            check.contains(maneuver.effects, new ShipValueDiff(ship3, "shield", -30), "ship3 shield value");
            check.contains(maneuver.effects, new ShipValueDiff(ship3, "hull", -20), "ship3 hull value");
            check.contains(maneuver.effects, new ShipDamageDiff(ship2, 0, 50, 50), "ship2 damage");
            check.contains(maneuver.effects, new ShipDamageDiff(ship3, 20, 30, 50), "ship3 damage");
        });
    });
}
