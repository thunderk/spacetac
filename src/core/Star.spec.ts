module TK.SpaceTac.Specs {
    testing("Star", test => {
        test.case("lists links to other stars", check => {
            var universe = new Universe();
            universe.stars.push(new Star(universe, 0, 0, "Star A"));
            universe.stars.push(new Star(universe, 1, 0, "Star B"));
            universe.stars.push(new Star(universe, 0, 1, "Star C"));
            universe.stars.push(new Star(universe, 1, 1, "Star D"));
            universe.addLink(universe.stars[0], universe.stars[1]);
            universe.addLink(universe.stars[0], universe.stars[3]);

            var result = universe.stars[0].getLinks();
            check.equals(result.length, 2);
            check.equals(result[0], new StarLink(universe.stars[0], universe.stars[1]));
            check.equals(result[1], new StarLink(universe.stars[0], universe.stars[3]));

            check.equals(universe.stars[0].getLinkTo(universe.stars[1]), universe.starlinks[0]);
            check.equals(universe.stars[0].getLinkTo(universe.stars[2]), null);
            check.equals(universe.stars[0].getLinkTo(universe.stars[3]), universe.starlinks[1]);
            check.equals(universe.stars[1].getLinkTo(universe.stars[0]), universe.starlinks[0]);
            check.equals(universe.stars[1].getLinkTo(universe.stars[2]), null);
            check.equals(universe.stars[1].getLinkTo(universe.stars[3]), null);
            check.equals(universe.stars[2].getLinkTo(universe.stars[0]), null);
            check.equals(universe.stars[2].getLinkTo(universe.stars[1]), null);
            check.equals(universe.stars[2].getLinkTo(universe.stars[3]), null);
            check.equals(universe.stars[3].getLinkTo(universe.stars[0]), universe.starlinks[1]);
            check.equals(universe.stars[3].getLinkTo(universe.stars[1]), null);
            check.equals(universe.stars[3].getLinkTo(universe.stars[2]), null);

            let neighbors = universe.stars[0].getNeighbors();
            check.equals(neighbors.length, 2);
            check.contains(neighbors, universe.stars[1]);
            check.contains(neighbors, universe.stars[3]);
        });
    });
}
