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
            let universe = new Universe();
            let system1 = universe.addStar();
            let system2 = universe.addStar();
            let jump1 = system1.addLocation(StarLocationType.WARP);
            let jump2 = system2.addLocation(StarLocationType.WARP);
            jump1.setJumpDestination(jump2);
            jump2.setJumpDestination(jump1);
            let other1 = system1.addLocation(StarLocationType.PLANET);
            universe.updateLocations();

            let result = fleet.move(other1);
            check.in("cannot move from nowhere", check => {
                check.equals(result, false);
                check.equals(fleet.location, null);
            });

            fleet.setLocation(other1);
            check.in("force set to other1", check => {
                check.equals(fleet.location, other1.id);
            });

            result = fleet.move(jump2);
            check.in("other1=>jump2", check => {
                check.equals(result, false);
                check.equals(fleet.location, other1.id);
            });

            result = fleet.move(jump1);
            check.in("other1=>jump1", check => {
                check.equals(result, true);
                check.equals(fleet.location, jump1.id);
            });

            result = fleet.move(jump2);
            check.in("jump1=>jump2", check => {
                check.equals(result, true);
                check.equals(fleet.location, jump2.id);
            });

            result = fleet.move(other1);
            check.in("jump2=>other1", check => {
                check.equals(result, false);
                check.equals(fleet.location, jump2.id);
            });

            result = fleet.move(jump1);
            check.in("jump2=>jump1", check => {
                check.equals(result, true);
                check.equals(fleet.location, jump1.id);
            });
        });

        test.case("registers presence in locations, and keeps track of visited locations", check => {
            let fleet = new Fleet();
            let universe = new Universe();
            let star = universe.addStar();
            let loc1 = star.addLocation(StarLocationType.PLANET);
            let loc2 = star.addLocation(StarLocationType.PLANET);
            let loc3 = star.addLocation(StarLocationType.PLANET);
            universe.updateLocations();

            function checks(desc: string, fleets1: Fleet[], fleets2: Fleet[], fleets3: Fleet[], visited: RObjectId[]) {
                check.in(desc, check => {
                    check.equals(loc1.fleets, fleets1, "loc1 fleets");
                    check.equals(loc2.fleets, fleets2, "loc2 fleets");
                    check.equals(loc3.fleets, fleets3, "loc3 fleets");
                    check.equals(fleet.visited, visited, "visited");
                });
            }

            checks("initial", [], [], [], []);

            fleet.setLocation(loc1);
            checks("first move to loc1", [fleet], [], [], [loc1.id]);

            fleet.setLocation(loc1);
            checks("already in loc1", [fleet], [], [], [loc1.id]);

            fleet.setLocation(loc2);
            checks("first move to loc2", [], [fleet], [], [loc2.id, loc1.id]);

            fleet.setLocation(loc3);
            checks("first move to loc3", [], [], [fleet], [loc3.id, loc2.id, loc1.id]);

            fleet.setLocation(loc2);
            checks("go back to loc2", [], [fleet], [], [loc2.id, loc3.id, loc1.id]);
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
    });
}
