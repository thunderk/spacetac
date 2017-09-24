module TK.SpaceTac.Specs {
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
            let universe = new Universe();
            let fleet = new Fleet();

            missions.main = new Mission(universe, fleet);
            missions.main.addPart(new MissionPart(missions.main, "Do something"));
            missions.secondary = [
                new Mission(universe, fleet),
                new Mission(universe, fleet)
            ];
            missions.secondary[0].addPart(new MissionPart(missions.secondary[0], "Maybe do something"));
            missions.secondary[1].addPart(new MissionPart(missions.secondary[1], "Surely do something"));

            expect(missions.getCurrent().map(mission => mission.current_part.title)).toEqual([
                "Do something",
                "Maybe do something",
                "Surely do something",
            ]);

            missions.checkStatus();

            expect(missions.getCurrent().map(mission => mission.current_part.title)).toEqual([
                "Do something",
                "Maybe do something",
                "Surely do something",
            ]);

            spyOn(missions.secondary[0].current_part, "checkCompleted").and.returnValue(true);
            missions.checkStatus();

            expect(missions.getCurrent().map(mission => mission.current_part.title)).toEqual([
                "Do something",
                "Surely do something",
            ]);

            spyOn(missions.main.current_part, "checkCompleted").and.returnValue(true);
            missions.checkStatus();

            expect(missions.getCurrent().map(mission => mission.current_part.title)).toEqual([
                "Surely do something",
            ]);
            expect(missions.main).toBeNull();
        })

        it("builds a hash to help monitor status changes", function () {
            let universe = new Universe();
            universe.generate(4);
            let fleet = new Fleet();
            fleet.setLocation(universe.getStartLocation(), true);

            let missions = new ActiveMissions();
            let hash = missions.getHash();
            function checkChanged(info: string, expected = true) {
                let new_hash = missions.getHash();
                expect(new_hash != hash).toBe(expected, info);
                hash = new_hash;
                expect(missions.getHash()).toEqual(hash, "Stable after " + info);
            }
            checkChanged("Stable at init", false);

            missions.startMainStory(universe, fleet);
            checkChanged("Main story started");

            let mission = new Mission(universe, fleet);
            mission.addPart(new MissionPartConversation(mission, [new Ship()]));
            mission.addPart(new MissionPartConversation(mission, [new Ship()]));
            missions.addSecondary(mission, fleet);
            checkChanged("Secondary mission accepted");

            expect(mission.getIndex()).toBe(0);
            missions.checkStatus();
            expect(mission.getIndex()).toBe(1);
            checkChanged("First conversation ended");

            expect(missions.secondary.length).toBe(1);
            missions.checkStatus();
            expect(missions.secondary.length).toBe(0);
            checkChanged("Second conversation ended - mission removed");

            nn(missions.main).current_part.forceComplete();
            missions.checkStatus();
            checkChanged("Main mission progress");
        });
    })
}
