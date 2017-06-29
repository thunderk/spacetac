module TS.SpaceTac.Specs {
    describe("MainStory", () => {
        function checkPart(story: Mission, index: number, title: string) {
            expect(story.parts.indexOf(story.current_part)).toBe(index);
            expect(story.current_part.title).toMatch(title);
            expect(story.completed).toBe(false);
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
            checkPart(story, 0, "^Find your contact in .* system$");

            goTo(fleet, (<MissionPartGoTo>story.current_part).destination);
            checkPart(story, 1, "^Speak with your contact .*$");

            (<MissionPartDialog>story.current_part).skip();
            expect(story.checkStatus()).toBe(false, "story not complete");
        })
    })
}
