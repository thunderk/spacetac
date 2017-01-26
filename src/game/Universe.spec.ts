module TS.SpaceTac.Game.Specs {
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

        it("generates warp locations", () => {
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

            expect(getWarps(universe.stars[0]).length).toBe(0);
            expect(getWarps(universe.stars[1]).length).toBe(0);
            expect(getWarps(universe.stars[2]).length).toBe(0);

            universe.generateWarpLocations();

            var warps = getWarps(universe.stars[0]);
            expect(warps.length).toBe(2);
            expect(warps[0].jump_dest.star).toBe(universe.stars[1]);
            expect(warps[1].jump_dest.star).toBe(universe.stars[2]);
            expect(universe.stars[0].getWarpLocationTo(universe.stars[1])).toBe(warps[0]);
            expect(universe.stars[0].getWarpLocationTo(universe.stars[2])).toBe(warps[1]);
            warps = getWarps(universe.stars[1]);
            expect(warps.length).toBe(1);
            expect(warps[0].jump_dest.star).toBe(universe.stars[0]);
            expect(universe.stars[1].getWarpLocationTo(universe.stars[2])).toBeNull();
            warps = getWarps(universe.stars[2]);
            expect(warps.length).toBe(1);
            expect(warps[0].jump_dest.star).toBe(universe.stars[0]);
        });
    });
}
