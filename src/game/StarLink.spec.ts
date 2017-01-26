module TS.SpaceTac.Game.Specs {
    describe("StarLink", () => {
        it("checks link intersection", () => {
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
                        expect(first.isCrossing(second)).toBe(expected);
                        expect(second.isCrossing(first)).toBe(expected);
                    }
                });
            });
        });

        it("gets the peer of a given sector", () => {
            var star1 = new Star(null, 0, 0);
            var star2 = new Star(null, 0, 1);
            var star3 = new Star(null, 0, 1);
            var link1 = new StarLink(star1, star2);

            expect(link1.getPeer(star1)).toBe(star2);
            expect(link1.getPeer(star2)).toBe(star1);
            expect(link1.getPeer(star3)).toBeNull();
        });
    });
}
