module TS.SpaceTac.Specs {
    describe("MissionPartGoTo", () => {
        it("completes when the fleet is at location, without encounter", function () {
            let destination = new StarLocation(new Star(null, 0, 0, "Atanax"));
            destination.encounter_random = new SkewedRandomGenerator([0], true);

            let universe = new Universe();
            let fleet = new Fleet();
            let part = new MissionPartGoTo(new Mission(universe, fleet), destination, "Collect gems");

            expect(part.title).toEqual("Collect gems in Atanax system");
            expect(part.checkCompleted()).toBe(false, "Init location");

            fleet.setLocation(destination, true);
            expect(part.checkCompleted()).toBe(false, "Encounter not clear");

            destination.clearEncounter();
            expect(part.checkCompleted()).toBe(true, "Encouter cleared");

            fleet.setLocation(new StarLocation(), true);
            expect(part.checkCompleted()).toBe(false, "Went to another system");

            fleet.setLocation(destination, true);
            expect(part.checkCompleted()).toBe(true, "Back at destination");
        })

        it("force completes", function () {
            let destination = new StarLocation(new Star(null, 0, 0, "Atanax"));
            destination.encounter_random = new SkewedRandomGenerator([0], true);

            let universe = new Universe();
            let fleet = new Fleet();
            let part = new MissionPartGoTo(new Mission(universe, fleet), destination, "Investigate");

            expect(part.checkCompleted()).toBe(false);
            part.forceComplete();
            expect(part.checkCompleted()).toBe(true);
        });
    })
}
