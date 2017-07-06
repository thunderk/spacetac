module TS.SpaceTac.Specs {
    describe("MissionGenerator", () => {
        it("generates escort missions", () => {
            let universe = new Universe();
            let star1 = universe.addStar(1);
            let loc1 = star1.locations[0];
            let star2 = universe.addStar(2);
            let loc2 = star2.locations[0];
            let star3 = universe.addStar(3);
            let loc3 = star3.locations[0];
            universe.addLink(star1, star2);
            universe.addLink(star2, star3);

            let generator = new MissionGenerator(universe, 3, loc2);
            let mission = generator.generateEscort();

            expect(mission.title).toBe("Escort a ship to a level 3 system");
            expect(mission.parts.length).toBe(1);
            expect(mission.parts[0] instanceof MissionPartEscort).toBe(true);
            let escort = <MissionPartEscort>mission.parts[0];
            expect(escort.destination).toBe(loc3);
        });
    });
}
