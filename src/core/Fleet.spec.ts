module TK.SpaceTac {
    testing("Fleet", test => {
        test.case("get average level", check => {
            var fleet = new Fleet();
            check.equals(fleet.getLevel(), 0);

            fleet.addShip(new Ship());
            fleet.addShip(new Ship());
            fleet.addShip(new Ship());

            fleet.ships[0].level.forceLevel(2);
            fleet.ships[1].level.forceLevel(4);
            fleet.ships[2].level.forceLevel(7);
            check.equals(fleet.getLevel(), 4);
        });

        test.case("adds and removes ships", check => {
            let fleet1 = new Fleet();
            let fleet2 = new Fleet();

            let ship1 = fleet1.addShip();
            check.equals(fleet1.ships, [ship1]);
            check.equals(fleet2.ships, []);

            let ship2 = new Ship();
            check.equals(fleet1.ships, [ship1]);
            check.equals(fleet2.ships, []);

            fleet2.addShip(ship2);
            check.equals(fleet1.ships, [ship1]);
            check.equals(fleet2.ships, [ship2]);

            fleet1.addShip(ship2);
            check.equals(fleet1.ships, [ship1, ship2]);
            check.equals(fleet2.ships, []);

            fleet1.removeShip(ship1, fleet2);
            check.equals(fleet1.ships, [ship2]);
            check.equals(fleet2.ships, [ship1]);

            fleet1.removeShip(ship1);
            check.equals(fleet1.ships, [ship2]);
            check.equals(fleet2.ships, [ship1]);

            fleet1.removeShip(ship2);
            check.equals(fleet1.ships, []);
            check.equals(fleet2.ships, [ship1]);
        });

        test.case("changes location, only using jumps to travel between systems", check => {
            let fleet = new Fleet();
            let system1 = new Star();
            let system2 = new Star();
            let jump1 = new StarLocation(system1, StarLocationType.WARP);
            let jump2 = new StarLocation(system2, StarLocationType.WARP);
            jump1.setJumpDestination(jump2);
            jump2.setJumpDestination(jump1);
            let other1 = new StarLocation(system1, StarLocationType.PLANET);

            let result = fleet.setLocation(other1);
            check.equals(result, true);
            check.same(fleet.location, other1);

            result = fleet.setLocation(jump2);
            check.equals(result, false);
            check.same(fleet.location, other1);

            result = fleet.setLocation(jump1);
            check.equals(result, true);
            check.same(fleet.location, jump1);

            result = fleet.setLocation(jump2);
            check.equals(result, true);
            check.same(fleet.location, jump2);

            result = fleet.setLocation(other1);
            check.equals(result, false);
            check.same(fleet.location, jump2);

            result = fleet.setLocation(jump1);
            check.equals(result, true);
            check.same(fleet.location, jump1);
        });

        test.case("checks if a fleet is alive", check => {
            let battle = new Battle();
            let fleet = battle.fleets[0];
            check.equals(fleet.isAlive(), false);

            let ship1 = fleet.addShip();
            check.equals(fleet.isAlive(), true);

            let ship2 = fleet.addShip();
            check.equals(fleet.isAlive(), true);

            ship1.setDead();
            check.equals(fleet.isAlive(), true);

            ship2.setDead();
            check.equals(fleet.isAlive(), false);

            let ship3 = fleet.addShip();
            check.equals(fleet.isAlive(), true);

            let ship4 = fleet.addShip();
            ship4.critical = true;
            check.equals(fleet.isAlive(), true);

            ship4.setDead();
            check.equals(fleet.isAlive(), false);
        });

        test.case("adds cargo in first empty slot", check => {
            let fleet = new Fleet();
            let ship1 = fleet.addShip();
            ship1.cargo_space = 1;
            let ship2 = fleet.addShip();
            ship2.cargo_space = 2;

            check.equals(ship1.cargo, []);
            check.equals(ship2.cargo, []);

            let equipment1 = new Equipment();
            let result = fleet.addCargo(equipment1);
            check.equals(result, true);
            check.equals(ship1.cargo, [equipment1]);
            check.equals(ship2.cargo, []);

            let equipment2 = new Equipment();
            result = fleet.addCargo(equipment2);
            check.equals(result, true);
            check.equals(ship1.cargo, [equipment1]);
            check.equals(ship2.cargo, [equipment2]);

            let equipment3 = new Equipment();
            result = fleet.addCargo(equipment3);
            check.equals(result, true);
            check.equals(ship1.cargo, [equipment1]);
            check.equals(ship2.cargo, [equipment2, equipment3]);

            let equipment4 = new Equipment();
            result = fleet.addCargo(equipment4);
            check.equals(result, false);
            check.equals(ship1.cargo, [equipment1]);
            check.equals(ship2.cargo, [equipment2, equipment3]);
        });
    });
}
