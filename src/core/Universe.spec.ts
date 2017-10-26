module TK.SpaceTac.Specs {
    testing("Universe", test => {
        test.case("generates star systems", check => {
            var universe = new Universe();
            var result = universe.generateStars(31);

            check.equals(result.length, 31);
        });

        test.case("lists potential links between star systems", check => {
            var universe = new Universe();
            universe.stars.push(new Star(universe, 0, 0));
            universe.stars.push(new Star(universe, 0, 1));
            universe.stars.push(new Star(universe, 1, 0));

            var result = universe.getPotentialLinks();
            check.equals(result.length, 3);
            check.equals(result[0], new StarLink(universe.stars[0], universe.stars[1]));
            check.equals(result[1], new StarLink(universe.stars[0], universe.stars[2]));
            check.equals(result[2], new StarLink(universe.stars[1], universe.stars[2]));
        });

        test.case("filters out crossing links", check => {
            var universe = new Universe();
            universe.stars.push(new Star(universe, 0, 0));
            universe.stars.push(new Star(universe, 0, 1));
            universe.stars.push(new Star(universe, 1, 0));
            universe.stars.push(new Star(universe, 2, 2));

            var result = universe.getPotentialLinks();
            check.equals(result.length, 6);

            var filtered = universe.filterCrossingLinks(result);
            check.equals(filtered.length, 5);
            check.equals(any(filtered, link => link.isLinking(universe.stars[1], universe.stars[2])), true);
            check.equals(any(filtered, link => link.isLinking(universe.stars[0], universe.stars[3])), false);
        });

        test.case("filters out redundant links", check => {
            let universe = new Universe();
            let s1 = universe.addStar(1, "S1", 0, 0);
            let s2 = universe.addStar(1, "S2", 0, 1);
            let s3 = universe.addStar(1, "S3", 1, 0);
            let s4 = universe.addStar(1, "S4", 0.75, 0.75);

            let links = [
                new StarLink(s1, s2),
                new StarLink(s1, s3),
                new StarLink(s2, s3),
                new StarLink(s2, s4),
                new StarLink(s3, s4),
            ]

            let filtered = universe.filterRedundantLinks(links);
            check.equals(filtered.length, 4);
            check.contains(filtered, links[0]);
            check.notcontains(filtered, links[2]);
        });

        test.case("generates warp locations", check => {
            var universe = new Universe();
            universe.stars.push(new Star(universe, 0, 0, "0"));
            universe.stars.push(new Star(universe, 1, 0, "1"));
            universe.stars.push(new Star(universe, 1, 1, "2"));
            universe.addLink(universe.stars[0], universe.stars[1]);
            universe.addLink(universe.stars[0], universe.stars[2]);

            var getWarps = (star: Star): StarLocation[] => {
                var result: StarLocation[] = [];
                star.locations.forEach((location: StarLocation) => {
                    if (location.type === StarLocationType.WARP) {
                        result.push(location);
                    }
                });
                return result;
            };

            check.equals(getWarps(universe.stars[0]).length, 0);
            check.equals(getWarps(universe.stars[1]).length, 0);
            check.equals(getWarps(universe.stars[2]).length, 0);

            universe.generateWarpLocations();

            var warps = getWarps(universe.stars[0]);
            check.equals(warps.length, 2);
            check.same(nn(warps[0].jump_dest).star, universe.stars[1]);
            check.same(nn(warps[1].jump_dest).star, universe.stars[2]);
            check.same(universe.stars[0].getWarpLocationTo(universe.stars[1]), warps[0]);
            check.same(universe.stars[0].getWarpLocationTo(universe.stars[2]), warps[1]);
            warps = getWarps(universe.stars[1]);
            check.equals(warps.length, 1);
            check.same(nn(warps[0].jump_dest).star, universe.stars[0]);
            check.equals(universe.stars[1].getWarpLocationTo(universe.stars[2]), null);
            warps = getWarps(universe.stars[2]);
            check.equals(warps.length, 1);
            check.same(nn(warps[0].jump_dest).star, universe.stars[0]);
        });

        test.case("generates danger gradients", check => {
            let universe = new Universe();

            universe.stars.push(new Star(universe));
            universe.stars.push(new Star(universe));
            universe.stars.push(new Star(universe));
            universe.stars.push(new Star(universe));

            universe.addLink(universe.stars[0], universe.stars[1]);
            universe.addLink(universe.stars[0], universe.stars[2]);
            universe.addLink(universe.stars[3], universe.stars[1]);
            universe.addLink(universe.stars[3], universe.stars[2]);

            universe.setEncounterLevels(9);
            check.equals(universe.stars.map(star => star.level).sort(cmp), [1, 5, 5, 9]);
        });

        test.case("gets a good start location", check => {
            let universe = new Universe();

            universe.stars.push(new Star(universe));
            universe.stars.push(new Star(universe));
            universe.stars.push(new Star(universe));

            universe.stars[0].level = 8;
            universe.stars[1].level = 1;
            universe.stars[2].level = 4;

            universe.stars[1].generateLocations(5);

            check.same(universe.getStartLocation(), universe.stars[1].locations[0]);
        });
    });
}
