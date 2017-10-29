module TK.SpaceTac.Specs {
    testing("MainStory", test => {
        function checkPart(story: Mission, index: number, title: RegExp, completed = false) {
            let result = story.checkStatus();
            test.check.same(story.parts.indexOf(story.current_part), index);
            test.check.regex(title, story.current_part.title);
            test.check.same(story.completed, completed);
            test.check.same(result, !completed);
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

        test.case("can be completed", check => {
            let session = new GameSession();
            session.startNewGame(true, true);
            let fleet = nn(session.player.fleet);

            let missions = session.player.missions;
            let story = nn(missions.main);
            let fleet_size = fleet.ships.length;

            checkPart(story, 0, /^Travel to Terranax galaxy$/);
            (<MissionPartConversation>story.current_part).skip();

            checkPart(story, 1, /^Find your contact in .*$/);
            goTo(fleet, (<MissionPartGoTo>story.current_part).destination);

            checkPart(story, 2, /^Speak with your contact/);
            (<MissionPartConversation>story.current_part).skip();

            checkPart(story, 3, /^Go with .* in .* system$/);
            check.same(fleet.ships.length, fleet_size + 1);
            goTo(fleet, (<MissionPartEscort>story.current_part).destination);

            checkPart(story, 4, /^Listen to .*$/);
            (<MissionPartConversation>story.current_part).skip();
            check.equals(session.getBattle(), null);

            checkPart(story, 5, /^Fight the arrived fleet$/);
            check.notequals(session.getBattle(), null);
            nn(session.getBattle()).endBattle(fleet);

            check.same(story.checkStatus(), false, "story not complete");
        })
    })
}
