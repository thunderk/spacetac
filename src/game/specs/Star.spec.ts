module SpaceTac.Game.Specs {
    "use strict";

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
        });

        it("generates warp locations", () => {
            var universe = new Universe();
            universe.stars.push(new Star(universe, 0, 0));
            universe.stars.push(new Star(universe, 1, 0));
            universe.stars.push(new Star(universe, 1, 1));
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

            expect(getWarps(universe.stars[0]).length).toBe(0);
            expect(getWarps(universe.stars[1]).length).toBe(0);
            expect(getWarps(universe.stars[2]).length).toBe(0);

            universe.stars[0].generate();

            expect(getWarps(universe.stars[0]).length).toBe(2);
            expect(getWarps(universe.stars[1]).length).toBe(0);
            expect(getWarps(universe.stars[2]).length).toBe(0);

            universe.stars[1].generate();

            expect(getWarps(universe.stars[0]).length).toBe(2);
            expect(getWarps(universe.stars[1]).length).toBe(1);
            expect(getWarps(universe.stars[2]).length).toBe(0);

            universe.stars[2].generate();

            var warps = getWarps(universe.stars[0]);
            expect(warps.length).toBe(2);
            expect(warps[0].jump_dest).toBe(universe.stars[2].locations[1]);
            expect(warps[1].jump_dest).toBe(universe.stars[1].locations[1]);
            warps = getWarps(universe.stars[1]);
            expect(warps.length).toBe(1);
            expect(warps[0].jump_dest).toBe(universe.stars[0].locations[2]);
            warps = getWarps(universe.stars[2]);
            expect(warps.length).toBe(1);
            expect(warps[0].jump_dest).toBe(universe.stars[0].locations[1]);
        });
    });
}
