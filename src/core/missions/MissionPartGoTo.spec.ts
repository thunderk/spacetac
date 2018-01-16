module TK.SpaceTac.Specs {
    testing("MissionPartGoTo", test => {
        test.case("completes when the fleet is at location, without encounter", check => {
            let destination = new StarLocation(new Star(null, 0, 0, "Atanax"));
            destination.encounter_random = new SkewedRandomGenerator([0], true);

            let universe = new Universe();
            let fleet = new Fleet();
            let part = new MissionPartGoTo(new Mission(universe, fleet), destination);

            check.equals(part.title, "Go to Atanax system");
            check.same(part.checkCompleted(), false, "Init location");

            fleet.setLocation(destination);
            check.same(part.checkCompleted(), false, "Encounter not clear");

            destination.clearEncounter();
            check.same(part.checkCompleted(), true, "Encouter cleared");

            fleet.setLocation(new StarLocation());
            check.same(part.checkCompleted(), false, "Went to another system");

            fleet.setLocation(destination);
            check.same(part.checkCompleted(), true, "Back at destination");
        })

        test.case("force completes", check => {
            let destination = new StarLocation(new Star(null, 0, 0, "Atanax"));
            destination.encounter_random = new SkewedRandomGenerator([0], true);

            let universe = new Universe();
            let fleet = new Fleet();
            let part = new MissionPartGoTo(new Mission(universe, fleet), destination, "Investigate");

            check.equals(part.title, "Investigate");
            check.equals(part.checkCompleted(), false);
            part.forceComplete();
            check.equals(part.checkCompleted(), true);
        });
    })
}
