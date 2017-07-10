module TS.SpaceTac.Specs {
    describe("MissionGenerator", () => {
        it("generates escort missions", () => {
            let universe = new Universe();
            let star1 = universe.addStar(1);
            let loc1 = star1.locations[0];
            let star2 = universe.addStar(2);
            let loc2 = star2.locations[0];
            universe.addLink(star1, star2);

            let generator = new MissionGenerator(universe, loc1);
            let mission = generator.generateEscort();

            expect(mission.title).toBe("Escort a ship to a level 2 system");
            expect(mission.parts.length).toBe(1);
            expect(mission.parts[0] instanceof MissionPartEscort).toBe(true);
            let escort = <MissionPartEscort>mission.parts[0];
            expect(escort.destination).toBe(loc2);
            expect(escort.ship.level.get()).toBe(2);
        });

        it("generates location cleaning missions", () => {
            let universe = new Universe();
            let star1 = universe.addStar(1);
            let loc1 = star1.locations[0];
            let loc2 = star1.addLocation(StarLocationType.PLANET);

            let generator = new MissionGenerator(universe, loc1);
            let mission = generator.generateCleanLocation();

            expect(mission.title).toBe("Defeat a level 1 fleet in this system");
            expect(mission.parts.length).toBe(1);
            expect(mission.parts[0] instanceof MissionPartCleanLocation).toBe(true);
            let part = <MissionPartCleanLocation>mission.parts[0];
            expect(part.destination).toBe(loc2);
        });
    });
}
