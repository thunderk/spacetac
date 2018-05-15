module TK.SpaceTac.UI.Specs {
    testing("FleetDisplay", test => {
        let testgame = setupMapview(test);

        test.case("orbits the fleet around its current location", check => {
            let mapview = testgame.view;
            let fleet = mapview.player_fleet;

            fleet.loopOrbit();
            check.equals(fleet.rotation, 0);

            let tweendata = mapview.animations.simulate(fleet, "rotation", 4);
            check.equals(tweendata.length, 4);
            check.nears(tweendata[0], 0);
            check.nears(tweendata[1], -Math.PI * 2 / 3);
            check.nears(tweendata[2], Math.PI * 2 / 3);
            check.nears(tweendata[3], 0);
        });
    });
}
