module TK.SpaceTac.Specs {
    testing("MissionPartEscort", test => {
        test.case("completes when the fleet is at location, with its escort", check => {
            let destination = new StarLocation(new Star(null, 0, 0, "Atanax"));
            destination.encounter_random = new SkewedRandomGenerator([0], true);

            let universe = new Universe();
            let fleet = new Fleet();
            let ship = new Ship(null, "Zybux");
            let part = new MissionPartEscort(new Mission(universe, fleet), destination, ship);

            check.notcontains(fleet.ships, ship);
            check.equals(part.title, "Escort Zybux to Atanax system");
            check.same(part.checkCompleted(), false, "Init location");

            part.onStarted();
            check.contains(fleet.ships, ship);

            fleet.setLocation(destination);
            check.same(part.checkCompleted(), false, "Encounter not clear");

            destination.clearEncounter();
            check.same(part.checkCompleted(), true, "Encouter cleared");

            fleet.setLocation(new StarLocation());
            check.same(part.checkCompleted(), false, "Went to another system");

            fleet.setLocation(destination);
            check.same(part.checkCompleted(), true, "Back at destination");
            check.contains(fleet.ships, ship);

            part.onEnded();
            check.notcontains(fleet.ships, ship);
        })

        test.case("sets the escorted ship as critical in battles", check => {
            let universe = new Universe();
            let fleet = new Fleet();
            let ship1 = fleet.addShip();
            let ship2 = fleet.addShip();
            let ship = new Ship();
            let destination = new StarLocation(new Star());
            let part = new MissionPartEscort(new Mission(universe, fleet), destination, ship);

            part.onStarted();
            check.contains(fleet.ships, ship);

            let enemy = new Fleet();
            enemy.addShip();
            let battle = new Battle(fleet, enemy);
            battle.ships.list().forEach(ship => TestTools.setShipModel(ship, 10, 0));
            battle.start();
            battle.performChecks();
            check.equals(battle.ended, false);

            // if a fleet member dies, it is not over
            ship1.setDead();
            battle.performChecks();
            check.equals(battle.ended, false);

            // if the critical ship dies, it is defeat
            ship.setDead();
            battle.performChecks();
            check.equals(battle.ended, true);
            check.notsame(nn(battle.outcome).winner, fleet.id);
        })
    })
}
