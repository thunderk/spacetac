module TK.SpaceTac.Specs {
    testing("MissionPartEscort", test => {
        test.case("completes when the fleet is at location, and the encounter is clean", check => {
            let destination = new StarLocation(new Star(null, 0, 0, "Atanax"));
            destination.clearEncounter();

            let universe = new Universe();
            let fleet = new Fleet();
            let part = new MissionPartCleanLocation(new Mission(universe, fleet), destination);

            check.equals(part.title, "Clean a planet in Atanax system");
            check.same(part.checkCompleted(), false, "Init location");

            check.equals(destination.isClear(), true);
            part.onStarted();
            check.equals(destination.isClear(), false);

            fleet.setLocation(destination);
            check.same(part.checkCompleted(), false, "Encounter not clear");

            destination.clearEncounter();
            check.same(part.checkCompleted(), true, "Encouter cleared");
        })

        test.case("generates the battle immediately if the fleet is already at the destination", check => {
            let destination = new StarLocation(new Star(null, 0, 0, "Atanax"));
            destination.clearEncounter();

            let universe = new Universe();
            let fleet = new Fleet();
            fleet.setLocation(destination);
            let part = new MissionPartCleanLocation(new Mission(universe, fleet), destination);

            check.equals(fleet.battle, null);
            part.onStarted();
            check.notequals(fleet.battle, null);
            check.equals(nn(fleet.battle).fleets, [fleet, nn(destination.encounter)]);
            check.equals(part.checkCompleted(), false);
        })
    })
}
