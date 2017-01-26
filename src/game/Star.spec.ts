module TS.SpaceTac.Game.Specs {
    describe("Star", () => {
        it("lists links to other stars", () => {
            var universe = new Universe();
            universe.stars.push(new Star(universe, 0, 0));
            universe.stars.push(new Star(universe, 1, 0));
            universe.stars.push(new Star(universe, 0, 1));
            universe.stars.push(new Star(universe, 1, 1));
            universe.addLink(universe.stars[0], universe.stars[1]);
            universe.addLink(universe.stars[0], universe.stars[3]);

            var result = universe.stars[0].getLinks();
            expect(result.length).toBe(2);
            expect(result[0]).toEqual(new StarLink(universe.stars[0], universe.stars[1]));
            expect(result[1]).toEqual(new StarLink(universe.stars[0], universe.stars[3]));

            expect(universe.stars[0].getLinkTo(universe.stars[1])).toEqual(universe.starlinks[0]);
            expect(universe.stars[0].getLinkTo(universe.stars[2])).toBeNull();
            expect(universe.stars[0].getLinkTo(universe.stars[3])).toEqual(universe.starlinks[1]);
            expect(universe.stars[1].getLinkTo(universe.stars[0])).toEqual(universe.starlinks[0]);
            expect(universe.stars[1].getLinkTo(universe.stars[2])).toBeNull();
            expect(universe.stars[1].getLinkTo(universe.stars[3])).toBeNull();
            expect(universe.stars[2].getLinkTo(universe.stars[0])).toBeNull();
            expect(universe.stars[2].getLinkTo(universe.stars[1])).toBeNull();
            expect(universe.stars[2].getLinkTo(universe.stars[3])).toBeNull();
            expect(universe.stars[3].getLinkTo(universe.stars[0])).toEqual(universe.starlinks[1]);
            expect(universe.stars[3].getLinkTo(universe.stars[1])).toBeNull();
            expect(universe.stars[3].getLinkTo(universe.stars[2])).toBeNull();
        });
    });
}
