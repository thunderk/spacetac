module TS.SpaceTac.Specs {
    describe("Mission", () => {
        it("check step status", function () {
            let mission = new Mission([
                new MissionPart("Part 1"),
                new MissionPart("Part 2")
            ]);
            let universe = new Universe();
            let fleet = new Fleet();

            expect(mission.current_part).toBe(mission.parts[0]);

            let result = mission.checkStatus(fleet, universe);
            expect(result).toBe(true);
            expect(mission.current_part).toBe(mission.parts[0]);

            spyOn(mission.parts[0], "checkCompleted").and.returnValues(false, true);

            result = mission.checkStatus(fleet, universe);
            expect(result).toBe(true);
            expect(mission.current_part).toBe(mission.parts[0]);
            result = mission.checkStatus(fleet, universe);
            expect(result).toBe(true);
            expect(mission.current_part).toBe(mission.parts[1]);
            result = mission.checkStatus(fleet, universe);
            expect(result).toBe(true);
            expect(mission.current_part).toBe(mission.parts[1]);

            spyOn(mission.parts[1], "checkCompleted").and.returnValue(true);

            result = mission.checkStatus(fleet, universe);
            expect(result).toBe(false);
            expect(mission.current_part).toBe(mission.parts[1]);
        })
    })
}
