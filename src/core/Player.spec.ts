module TK.SpaceTac {
    testing("Player", test => {
        test.case("keeps track of visited locations", check => {
            let player = new Player();
            let universe = new Universe();
            let star1 = universe.addStar();
            let star2 = universe.addStar();
            let loc1a = star1.addLocation(StarLocationType.PLANET);
            let loc1b = star1.addLocation(StarLocationType.PLANET);
            let loc2a = star2.addLocation(StarLocationType.PLANET);
            let loc2b = star2.addLocation(StarLocationType.PLANET);
            universe.updateLocations();

            function checkVisited(s1 = false, s2 = false, v1a = false, v1b = false, v2a = false, v2b = false) {
                check.same(player.hasVisitedSystem(star1), s1);
                check.same(player.hasVisitedSystem(star2), s2);
                check.same(player.hasVisitedLocation(loc1a), v1a);
                check.same(player.hasVisitedLocation(loc1b), v1b);
                check.same(player.hasVisitedLocation(loc2a), v2a);
                check.same(player.hasVisitedLocation(loc2b), v2b);
            }

            checkVisited();

            player.fleet.setLocation(loc1b);
            checkVisited(true, false, false, true, false, false);

            player.fleet.setLocation(loc1a);
            checkVisited(true, false, true, true, false, false);

            player.fleet.setLocation(loc2a);
            checkVisited(true, true, true, true, true, false);

            player.fleet.setLocation(loc2a);
            checkVisited(true, true, true, true, true, false);
        });
    });
}