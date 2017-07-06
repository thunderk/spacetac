module TS.SpaceTac.Specs {
    describe("MainStory", () => {
        function checkPart(story: Mission, index: number, title: string, completed = false) {
            let result = story.checkStatus();
            expect(story.parts.indexOf(story.current_part)).toBe(index);
            expect(story.current_part.title).toMatch(title);
            expect(story.completed).toBe(completed);
            expect(result).toBe(!completed);
        }

        function goTo(fleet: Fleet, location: StarLocation, win_encounter = true) {
            fleet.setLocation(location, true);
            if (fleet.battle) {
                fleet.battle.endBattle(win_encounter ? fleet : fleet.battle.fleets[1]);
                if (win_encounter) {
                    fleet.player.exitBattle();
                } else {
                    fleet.player.revertBattle();
                }
            }
        }

        it("can be completed", function () {
            let session = new GameSession();
            session.startNewGame(true, true);
            let fleet = nn(session.player.fleet);

            let missions = session.player.missions;
            let story = nn(missions.main);
            let fleet_size = fleet.ships.length;

            checkPart(story, 0, "^Travel to Terranax galaxy$");
            (<MissionPartConversation>story.current_part).skip();

            checkPart(story, 1, "^Find your contact in .*$");
            goTo(fleet, (<MissionPartGoTo>story.current_part).destination);

            checkPart(story, 2, "^Speak with your contact");
            (<MissionPartConversation>story.current_part).skip();

            checkPart(story, 3, "^Go with .* in .* system$");
            expect(fleet.ships.length).toBe(fleet_size + 1);
            goTo(fleet, (<MissionPartEscort>story.current_part).destination);

            expect(story.checkStatus()).toBe(false, "story not complete");
        })
    })
}
