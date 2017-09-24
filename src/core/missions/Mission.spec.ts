module TK.SpaceTac.Specs {
    describe("Mission", () => {
        it("check step status", function () {
            let universe = new Universe();
            let fleet = new Fleet();
            let mission = new Mission(universe, fleet);
            mission.addPart(new MissionPart(mission, "Part 1"));
            mission.addPart(new MissionPart(mission, "Part 2"));

            expect(mission.current_part).toBe(mission.parts[0]);

            let result = mission.checkStatus();
            expect(result).toBe(true);
            expect(mission.current_part).toBe(mission.parts[0]);

            spyOn(mission.parts[0], "checkCompleted").and.returnValues(false, true);

            result = mission.checkStatus();
            expect(result).toBe(true);
            expect(mission.current_part).toBe(mission.parts[0]);
            result = mission.checkStatus();
            expect(result).toBe(true);
            expect(mission.current_part).toBe(mission.parts[1]);
            result = mission.checkStatus();
            expect(result).toBe(true);
            expect(mission.current_part).toBe(mission.parts[1]);

            spyOn(mission.parts[1], "checkCompleted").and.returnValue(true);

            result = mission.checkStatus();
            expect(result).toBe(false);
            expect(mission.current_part).toBe(mission.parts[1]);
        })

        it("stores a reward", function () {
            let mission = new Mission(new Universe());
            expect(mission.getRewardText()).toEqual("-");

            mission.reward = 720;
            expect(mission.getRewardText()).toEqual("720 zotys");

            mission.reward = new Equipment();
            mission.reward.name = "Super Equipment";
            expect(mission.getRewardText()).toEqual("Super Equipment Mk1");
        })

        it("gives the reward on completion", function () {
            let fleet = new Fleet();
            let ship = fleet.addShip();
            ship.cargo_space = 5;
            fleet.credits = 150;

            let mission = new Mission(new Universe(), fleet);
            mission.reward = 75;
            mission.setCompleted();
            expect(mission.completed).toBe(true);
            expect(fleet.credits).toBe(225);

            mission.setCompleted();
            expect(fleet.credits).toBe(225);

            mission = new Mission(new Universe(), fleet);
            mission.reward = new Equipment();
            expect(ship.cargo).toEqual([]);
            mission.setCompleted();
            expect(mission.completed).toBe(true);
            expect(fleet.credits).toBe(225);
            expect(ship.cargo).toEqual([mission.reward]);
        })
    })
}
