module TK.SpaceTac {
    testing("Player", test => {
        test.case("keeps track of visited locations", check => {
            let player = new Player();
            let star1 = new Star();
            let star2 = new Star();
            let loc1a = new StarLocation(star1);
            let loc1b = new StarLocation(star1);
            let loc2a = new StarLocation(star2);
            let loc2b = new StarLocation(star2);

            function checkVisited(s1 = false, s2 = false, v1a = false, v1b = false, v2a = false, v2b = false) {
                check.same(player.hasVisitedSystem(star1), s1);
                check.same(player.hasVisitedSystem(star2), s2);
                check.same(player.hasVisitedLocation(loc1a), v1a);
                check.same(player.hasVisitedLocation(loc1b), v1b);
                check.same(player.hasVisitedLocation(loc2a), v2a);
                check.same(player.hasVisitedLocation(loc2b), v2b);
            }

            checkVisited();

            player.setVisited(loc1b);

            checkVisited(true, false, false, true, false, false);

            player.setVisited(loc1a);

            checkVisited(true, false, true, true, false, false);

            player.setVisited(loc2a);

            checkVisited(true, true, true, true, true, false);

            player.setVisited(loc2a);

            checkVisited(true, true, true, true, true, false);
        });

        test.case("reverts battle", check => {
            let player = new Player();
            let star = new Star();
            let loc1 = new StarLocation(star);
            loc1.clearEncounter();
            let loc2 = new StarLocation(star);
            loc2.encounter_random = new SkewedRandomGenerator([0], true);

            player.fleet.setLocation(loc1);
            check.equals(player.getBattle(), null);
            check.same(player.fleet.location, loc1);

            player.fleet.setLocation(loc2);
            check.notequals(player.getBattle(), null);
            check.same(player.fleet.location, loc2);
            check.equals(player.hasVisitedLocation(loc2), true);
            let enemy = loc2.encounter;

            player.revertBattle();
            check.equals(player.getBattle(), null);
            check.same(player.fleet.location, loc1);
            check.equals(player.hasVisitedLocation(loc2), true);

            player.fleet.setLocation(loc2);
            check.notequals(player.getBattle(), null);
            check.same(player.fleet.location, loc2);
            check.equals(player.hasVisitedLocation(loc2), true);
            check.same(nn(player.getBattle()).fleets[1], nn(enemy));
        });
    });
}