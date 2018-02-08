module TK.SpaceTac.Specs {
    testing("MissionGenerator", test => {
        test.case("generates escort missions", check => {
            let universe = new Universe();
            let star1 = universe.addStar(1);
            let loc1 = star1.locations[0];
            let star2 = universe.addStar(2);
            let loc2 = star2.locations[0];
            universe.addLink(star1, star2);

            let generator = new MissionGenerator(universe, loc1);
            let mission = generator.generateEscort();

            check.equals(mission.title, "Escort a ship to a level 2 system");
            check.equals(mission.parts.length, 3);
            check.equals(mission.parts[0] instanceof MissionPartConversation, true);
            check.equals(mission.parts[1] instanceof MissionPartEscort, true);
            let escort = <MissionPartEscort>mission.parts[1];
            check.same(escort.destination, loc2);
            check.equals(escort.ship.level.get(), 2);
            check.equals(mission.parts[2] instanceof MissionPartConversation, true);
        })

        test.case("generates location cleaning missions", check => {
            let universe = new Universe();
            let star1 = universe.addStar(1, "TTX");
            let loc1 = star1.locations[0];
            let loc2 = star1.addLocation(StarLocationType.PLANET);

            let generator = new MissionGenerator(universe, loc1);
            let mission = generator.generateCleanLocation();

            check.equals(mission.title, "Defeat a level 1 fleet in this system");
            check.equals(mission.parts.length, 4);
            check.equals(mission.parts[0] instanceof MissionPartConversation, true);
            check.equals(mission.parts[1] instanceof MissionPartCleanLocation, true);
            let part1 = <MissionPartCleanLocation>mission.parts[1];
            check.same(part1.destination, loc2);
            check.equals(part1.title, "Clean a planet in TTX system");
            check.equals(mission.parts[2] instanceof MissionPartGoTo, true);
            let part2 = <MissionPartGoTo>mission.parts[2];
            check.same(part2.destination, loc1);
            check.equals(part2.title, "Go back to collect your reward");
            check.equals(mission.parts[3] instanceof MissionPartConversation, true);
        })

        test.case("helps to evaluate mission difficulty", check => {
            let generator = new MissionGenerator(new Universe(), new StarLocation());
            let mission = new Mission(generator.universe);
            check.same(mission.difficulty, MissionDifficulty.normal);
            check.equals(mission.value, 0);

            generator.setDifficulty(mission, 1000, 1);
            check.same(mission.difficulty, MissionDifficulty.normal);
            check.equals(mission.value, 1000);

            generator.setDifficulty(mission, 1000, 2);
            check.same(mission.difficulty, MissionDifficulty.hard);
            check.equals(mission.value, 2200);

            generator.setDifficulty(mission, 1000, 3);
            check.same(mission.difficulty, MissionDifficulty.hard);
            check.equals(mission.value, 3600);

            generator.around.star.level = 10;

            generator.setDifficulty(mission, 1000, 10);
            check.same(mission.difficulty, MissionDifficulty.normal);
            check.equals(mission.value, 10000);

            generator.setDifficulty(mission, 1000, 9);
            check.same(mission.difficulty, MissionDifficulty.easy);
            check.equals(mission.value, 8100);

            generator.setDifficulty(mission, 1000, 8);
            check.same(mission.difficulty, MissionDifficulty.easy);
            check.equals(mission.value, 6400);
        })
    });
}
