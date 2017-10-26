module TK.SpaceTac.Specs {
    testing("ActiveMissions", test => {
        test.case("starts the main story arc", check => {
            let missions = new ActiveMissions();
            check.equals(missions.main, null);

            let session = new GameSession();
            session.startNewGame(true, false);

            missions.startMainStory(session.universe, session.player.fleet);
            check.notequals(missions.main, null);
        })

        test.case("gets the current list of missions, and updates them", check => {
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

            check.equals(missions.getCurrent().map(mission => mission.current_part.title), [
                "Do something",
                "Maybe do something",
                "Surely do something",
            ]);

            missions.checkStatus();

            check.equals(missions.getCurrent().map(mission => mission.current_part.title), [
                "Do something",
                "Maybe do something",
                "Surely do something",
            ]);

            spyOn(missions.secondary[0].current_part, "checkCompleted").and.returnValue(true);
            missions.checkStatus();

            check.equals(missions.getCurrent().map(mission => mission.current_part.title), [
                "Do something",
                "Surely do something",
            ]);

            spyOn(missions.main.current_part, "checkCompleted").and.returnValue(true);
            missions.checkStatus();

            check.equals(missions.getCurrent().map(mission => mission.current_part.title), [
                "Surely do something",
            ]);
            check.equals(missions.main, null);
        })

        test.case("builds a hash to help monitor status changes", check => {
            let universe = new Universe();
            universe.generate(4);
            let fleet = new Fleet();
            fleet.setLocation(universe.getStartLocation(), true);

            let missions = new ActiveMissions();
            let hash = missions.getHash();
            function checkChanged(info: string, expected = true) {
                let new_hash = missions.getHash();
                check.same(new_hash != hash, expected, info);
                hash = new_hash;
                check.equals(missions.getHash(), hash, "Stable after " + info);
            }
            checkChanged("Stable at init", false);

            missions.startMainStory(universe, fleet);
            checkChanged("Main story started");

            let mission = new Mission(universe, fleet);
            mission.addPart(new MissionPartConversation(mission, [new Ship()]));
            mission.addPart(new MissionPartConversation(mission, [new Ship()]));
            missions.addSecondary(mission, fleet);
            checkChanged("Secondary mission accepted");

            check.equals(mission.getIndex(), 0);
            missions.checkStatus();
            check.equals(mission.getIndex(), 1);
            checkChanged("First conversation ended");

            check.equals(missions.secondary.length, 1);
            missions.checkStatus();
            check.equals(missions.secondary.length, 0);
            checkChanged("Second conversation ended - mission removed");

            nn(missions.main).current_part.forceComplete();
            missions.checkStatus();
            checkChanged("Main mission progress");
        });
    })
}
