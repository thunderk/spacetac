module TK.SpaceTac.Specs {
    testing("StarLocation", test => {
        test.case("removes generated encounters that lose", check => {
            var location = new StarLocation(undefined, StarLocationType.PLANET, 0, 0);
            var fleet = new Fleet();
            fleet.addShip();
            location.encounter_random = new SkewedRandomGenerator([0]);
            var battle = nn(location.enterLocation(fleet));

            check.notequals(location.encounter, null);
            check.notequals(battle, null);

            battle.endBattle(fleet);
            check.notequals(location.encounter, null);

            location.resolveEncounter(nn(battle.outcome));
            check.equals(location.encounter, null);
        });

        test.case("leaves generated encounters that win", check => {
            var location = new StarLocation(undefined, StarLocationType.PLANET, 0, 0);
            var fleet = new Fleet();
            fleet.addShip();
            location.encounter_random = new SkewedRandomGenerator([0]);
            var battle = nn(location.enterLocation(fleet));

            check.notequals(location.encounter, null);
            check.notequals(battle, null);

            battle.endBattle(location.encounter);
            check.notequals(location.encounter, null);

            location.resolveEncounter(nn(battle.outcome));
            check.notequals(location.encounter, null);
        });
    });
}
