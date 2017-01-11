module SpaceTac.Game.Specs {
    describe("Universe", () => {
        it("generates star systems", () => {
            var universe = new Universe();
            var result = universe.generateStars(31);

            expect(result.length).toBe(31);
        });

        it("lists potential links between star systems", () => {
            var universe = new Universe();
            universe.stars.push(new Star(universe, 0, 0));
            universe.stars.push(new Star(universe, 0, 1));
            universe.stars.push(new Star(universe, 1, 0));

            var result = universe.getPotentialLinks();
            expect(result.length).toBe(3);
            expect(result[0]).toEqual(new StarLink(universe.stars[0], universe.stars[1]));
            expect(result[1]).toEqual(new StarLink(universe.stars[0], universe.stars[2]));
            expect(result[2]).toEqual(new StarLink(universe.stars[1], universe.stars[2]));
        });

        it("filters out crossing links", () => {
            var universe = new Universe();
            universe.stars.push(new Star(universe, 0, 0));
            universe.stars.push(new Star(universe, 0, 1));
            universe.stars.push(new Star(universe, 1, 0));
            universe.stars.push(new Star(universe, 2, 2));

            var result = universe.getPotentialLinks();
            expect(result.length).toBe(6);

            var filtered = universe.filterCrossingLinks(result);
            expect(filtered.length).toBe(5);
        });
    });
}
