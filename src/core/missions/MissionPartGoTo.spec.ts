module TS.SpaceTac.Specs {
    describe("MissionPartGoTo", () => {
        it("completes when the fleet is at location, without encounter", function () {
            let destination = new StarLocation(new Star(null, 0, 0, "Atanax"));
            destination.encounter_random = new SkewedRandomGenerator([0], true);
            let part = new MissionPartGoTo(destination, "Collect gems");

            let universe = new Universe();
            let fleet = new Fleet();

            expect(part.title).toEqual("Collect gems in Atanax system");
            expect(part.checkCompleted(fleet, universe)).toBe(false, "Init location");

            fleet.setLocation(destination, true);
            expect(part.checkCompleted(fleet, universe)).toBe(false, "Encounter not clear");

            destination.clearEncounter();
            expect(part.checkCompleted(fleet, universe)).toBe(true, "Encouter cleared");

            fleet.setLocation(new StarLocation(), true);
            expect(part.checkCompleted(fleet, universe)).toBe(false, "Went to another system");

            fleet.setLocation(destination, true);
            expect(part.checkCompleted(fleet, universe)).toBe(true, "Back at destination");
        })
    })
}
