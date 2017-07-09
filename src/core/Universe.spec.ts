module TS.SpaceTac.Specs {
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
            expect(any(filtered, link => link.isLinking(universe.stars[1], universe.stars[2]))).toBe(true);
            expect(any(filtered, link => link.isLinking(universe.stars[0], universe.stars[3]))).toBe(false);
        });

        it("filters out redundant links", () => {
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
            expect(filtered.length).toBe(4);
            expect(filtered).toContain(links[0]);
            expect(filtered).not.toContain(links[2]);
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
            expect(nn(warps[0].jump_dest).star).toBe(universe.stars[1]);
            expect(nn(warps[1].jump_dest).star).toBe(universe.stars[2]);
            expect(universe.stars[0].getWarpLocationTo(universe.stars[1])).toBe(warps[0]);
            expect(universe.stars[0].getWarpLocationTo(universe.stars[2])).toBe(warps[1]);
            warps = getWarps(universe.stars[1]);
            expect(warps.length).toBe(1);
            expect(nn(warps[0].jump_dest).star).toBe(universe.stars[0]);
            expect(universe.stars[1].getWarpLocationTo(universe.stars[2])).toBeNull();
            warps = getWarps(universe.stars[2]);
            expect(warps.length).toBe(1);
            expect(nn(warps[0].jump_dest).star).toBe(universe.stars[0]);
        });

        it("generates danger gradients", function () {
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
            expect(universe.stars.map(star => star.level).sort(cmp)).toEqual([1, 5, 5, 9]);
        });

        it("gets a good start location", function () {
            let universe = new Universe();

            universe.stars.push(new Star(universe));
            universe.stars.push(new Star(universe));
            universe.stars.push(new Star(universe));

            universe.stars[0].level = 8;
            universe.stars[1].level = 1;
            universe.stars[2].level = 4;

            universe.stars[1].generateLocations(5);

            expect(universe.getStartLocation()).toBe(universe.stars[1].locations[0]);
        });
    });
}
