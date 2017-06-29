module TS.SpaceTac.Specs {
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
    })
}
