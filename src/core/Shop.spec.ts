module TK.SpaceTac.Specs {
    testing("Shop", test => {
        test.case("generates secondary missions", check => {
            let universe = new Universe();
            universe.generate(4);
            let start = universe.getStartLocation();

            let shop = new Shop();
            check.equals((<any>shop).missions.length, 0);

            let result = shop.getMissions(start, 4);
            check.equals(result.length, 4);
            check.equals((<any>shop).missions.length, 4);

            let oresult = shop.getMissions(start, 4);
            check.equals(oresult, result);

            result.forEach(mission => {
                check.equals(mission.main, false);
            });
        });

        test.case("assigns missions to a fleet", check => {
            let shop = new Shop();
            let player = new Player();
            let mission = new Mission(new Universe());
            (<any>shop).missions = [mission];

            check.equals(shop.getMissions(new StarLocation(), 1), [mission]);
            check.equals(player.missions.secondary, []);

            shop.acceptMission(mission, player);

            check.equals((<any>shop).missions, []);
            check.equals(player.missions.secondary, [mission]);
            check.same(mission.fleet, player.fleet);
        });
    });
}
