module TK.SpaceTac.Specs {
    testing("StarLink", test => {
        test.case("checks link intersection", check => {
            var star1 = new Star(null, 0, 0);
            var star2 = new Star(null, 0, 1);
            var star3 = new Star(null, 1, 0);
            var star4 = new Star(null, 1, 1);
            var link1 = new StarLink(star1, star2);
            var link2 = new StarLink(star1, star3);
            var link3 = new StarLink(star1, star4);
            var link4 = new StarLink(star2, star3);
            var link5 = new StarLink(star2, star4);
            var link6 = new StarLink(star3, star4);
            var links = [link1, link2, link3, link4, link5, link6];
            links.forEach((first: StarLink) => {
                links.forEach((second: StarLink) => {
                    if (first !== second) {
                        var expected = (first === link3 && second === link4) ||
                            (first === link4 && second === link3);
                        check.same(first.isCrossing(second), expected);
                        check.same(second.isCrossing(first), expected);
                    }
                });
            });
        });

        test.case("gets the peer of a given sector", check => {
            var star1 = new Star(null, 0, 0);
            var star2 = new Star(null, 0, 1);
            var star3 = new Star(null, 0, 1);
            var link1 = new StarLink(star1, star2);

            check.same(link1.getPeer(star1), star2);
            check.same(link1.getPeer(star2), star1);
            check.equals(link1.getPeer(star3), null);
        });
    });
}
