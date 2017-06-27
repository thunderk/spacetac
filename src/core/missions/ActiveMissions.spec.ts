module TS.SpaceTac.Specs {
    describe("ActiveMissions", () => {
        it("starts the main story arc", function () {
            let missions = new ActiveMissions();
            expect(missions.main).toBeNull();

            let session = new GameSession();
            session.startNewGame(true, false);

            missions.startMainStory(session.universe, session.player.fleet);
            expect(missions.main).not.toBeNull();
        })

        it("gets the current list of missions, and updates them", function () {
            let missions = new ActiveMissions();

            missions.main = new Mission([new MissionPart("Do something")]);
            missions.secondary = [
                new Mission([new MissionPart("Maybe do something")]),
                new Mission([new MissionPart("Surely do something")])
            ];

            expect(missions.getCurrent().map(mission => mission.current_part.title)).toEqual([
                "Do something",
                "Maybe do something",
                "Surely do something",
            ]);

            let universe = new Universe();
            let fleet = new Fleet();
            missions.checkStatus(fleet, universe);

            expect(missions.getCurrent().map(mission => mission.current_part.title)).toEqual([
                "Do something",
                "Maybe do something",
                "Surely do something",
            ]);

            spyOn(missions.secondary[0].current_part, "checkCompleted").and.returnValue(true);
            missions.checkStatus(fleet, universe);

            expect(missions.getCurrent().map(mission => mission.current_part.title)).toEqual([
                "Do something",
                "Surely do something",
            ]);

            spyOn(missions.main.current_part, "checkCompleted").and.returnValue(true);
            missions.checkStatus(fleet, universe);

            expect(missions.getCurrent().map(mission => mission.current_part.title)).toEqual([
                "Surely do something",
            ]);
            expect(missions.main).toBeNull();
        })
    })
}
