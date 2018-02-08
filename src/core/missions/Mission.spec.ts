module TK.SpaceTac.Specs {
    testing("Mission", test => {
        test.case("check step status", check => {
            let universe = new Universe();
            let fleet = new Fleet();
            let mission = new Mission(universe, fleet);
            mission.addPart(new MissionPart(mission, "Part 1"));
            mission.addPart(new MissionPart(mission, "Part 2"));

            check.same(mission.current_part, mission.parts[0]);

            let result = mission.checkStatus();
            check.equals(result, true);
            check.same(mission.current_part, mission.parts[0]);

            check.patch(mission.parts[0], "checkCompleted", iterator([false, true]));

            result = mission.checkStatus();
            check.equals(result, true);
            check.same(mission.current_part, mission.parts[0]);
            result = mission.checkStatus();
            check.equals(result, true);
            check.same(mission.current_part, mission.parts[1]);
            result = mission.checkStatus();
            check.equals(result, true);
            check.same(mission.current_part, mission.parts[1]);

            check.patch(mission.parts[1], "checkCompleted", () => true);

            result = mission.checkStatus();
            check.equals(result, false);
            check.same(mission.current_part, mission.parts[1]);
        })

        test.case("stores a reward", check => {
            let mission = new Mission(new Universe());
            check.equals(mission.getRewardText(), "-");

            mission.reward = 720;
            check.equals(mission.getRewardText(), "720 zotys");
        })

        test.case("gives the reward on completion", check => {
            let fleet = new Fleet();
            let ship = fleet.addShip();
            fleet.credits = 150;

            let mission = new Mission(new Universe(), fleet);
            mission.reward = 75;
            mission.setCompleted();
            check.equals(mission.completed, true);
            check.equals(fleet.credits, 225);

            mission.setCompleted();
            check.equals(fleet.credits, 225);
        })
    })
}
