module TK.SpaceTac.Specs {
    describe("MissionPartEscort", () => {
        it("completes when the fleet is at location, and the encounter is clean", function () {
            let destination = new StarLocation(new Star(null, 0, 0, "Atanax"));
            destination.clearEncounter();

            let universe = new Universe();
            let fleet = new Fleet();
            let part = new MissionPartCleanLocation(new Mission(universe, fleet), destination);

            expect(part.title).toEqual("Clean a planet in Atanax system");
            expect(part.checkCompleted()).toBe(false, "Init location");

            expect(destination.isClear()).toBe(true);
            part.onStarted();
            expect(destination.isClear()).toBe(false);

            fleet.setLocation(destination, true);
            expect(part.checkCompleted()).toBe(false, "Encounter not clear");

            destination.clearEncounter();
            expect(part.checkCompleted()).toBe(true, "Encouter cleared");
        })

        it("generates the battle immediately if the fleet is already at the destination", function () {
            let destination = new StarLocation(new Star(null, 0, 0, "Atanax"));
            destination.clearEncounter();

            let universe = new Universe();
            let fleet = new Fleet();
            fleet.setLocation(destination, true);
            let part = new MissionPartCleanLocation(new Mission(universe, fleet), destination);

            expect(fleet.battle).toBeNull();
            part.onStarted();
            expect(fleet.battle).not.toBeNull();
            expect(nn(fleet.battle).fleets).toEqual([fleet, nn(destination.encounter)]);
            expect(part.checkCompleted()).toBe(false);
        })
    })
}
