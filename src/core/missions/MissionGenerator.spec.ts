module TS.SpaceTac.Specs {
    describe("MissionGenerator", function () {
        it("generates escort missions", function () {
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
        })

        it("generates location cleaning missions", function () {
            let universe = new Universe();
            let star1 = universe.addStar(1, "TTX");
            let loc1 = star1.locations[0];
            let loc2 = star1.addLocation(StarLocationType.PLANET);

            let generator = new MissionGenerator(universe, loc1);
            let mission = generator.generateCleanLocation();

            expect(mission.title).toBe("Defeat a level 1 fleet in this system");
            expect(mission.parts.length).toBe(2);
            expect(mission.parts[0] instanceof MissionPartCleanLocation).toBe(true);
            let part1 = <MissionPartCleanLocation>mission.parts[0];
            expect(part1.destination).toBe(loc2);
            expect(part1.title).toEqual("Clean a planet in TTX system");
            expect(mission.parts[0] instanceof MissionPartGoTo).toBe(true);
            let part2 = <MissionPartGoTo>mission.parts[1];
            expect(part2.destination).toBe(loc1);
            expect(part2.title).toEqual("Go back to collect your reward");
        })

        it("helps to evaluate mission difficulty", function () {
            let generator = new MissionGenerator(new Universe(), new StarLocation());
            let mission = new Mission(generator.universe);
            expect(mission.difficulty).toBe(MissionDifficulty.normal);
            expect(mission.value).toBe(0);

            generator.setDifficulty(mission, 1000, 1);
            expect(mission.difficulty).toBe(MissionDifficulty.normal);
            expect(mission.value).toBe(1000);

            generator.setDifficulty(mission, 1000, 2);
            expect(mission.difficulty).toBe(MissionDifficulty.hard);
            expect(mission.value).toBe(2200);

            generator.setDifficulty(mission, 1000, 3);
            expect(mission.difficulty).toBe(MissionDifficulty.hard);
            expect(mission.value).toBe(3600);

            generator.around.star.level = 10;

            generator.setDifficulty(mission, 1000, 10);
            expect(mission.difficulty).toBe(MissionDifficulty.normal);
            expect(mission.value).toBe(10000);

            generator.setDifficulty(mission, 1000, 9);
            expect(mission.difficulty).toBe(MissionDifficulty.easy);
            expect(mission.value).toBe(8100);

            generator.setDifficulty(mission, 1000, 8);
            expect(mission.difficulty).toBe(MissionDifficulty.easy);
            expect(mission.value).toBe(6400);
        })

        it("generates equipment reward", function () {
            let generator = new MissionGenerator(new Universe(), new StarLocation());
            let template = new LootTemplate(SlotType.Weapon, "Test Weapon");
            generator.equipment_generator.templates = [template];

            template.price = 350;
            let result = generator.tryGenerateEquipmentReward(500);
            expect(result).toBeNull();

            template.price = 800;
            result = generator.tryGenerateEquipmentReward(500);
            expect(result).toBeNull();

            template.price = 500;
            result = generator.tryGenerateEquipmentReward(500);
            expect(result).not.toBeNull();
        })

        it("falls back to money reward when no suitable equipment have been generated", function () {
            let generator = new MissionGenerator(new Universe(), new StarLocation());
            generator.equipment_generator.templates = [];

            let result = generator.generateReward(15000);
            expect(result).toBe(15000);

            let template = new LootTemplate(SlotType.Weapon, "Test Weapon");
            template.price = 15000;
            generator.equipment_generator.templates.push(template);

            generator.random = new SkewedRandomGenerator([0], true);
            result = generator.generateReward(15000);
            expect(result instanceof Equipment).toBe(true);
        })
    });
}
