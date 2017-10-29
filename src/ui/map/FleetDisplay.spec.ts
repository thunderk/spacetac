module TK.SpaceTac.UI.Specs {
    testing("FleetDisplay", test => {
        let testgame = setupMapview(test);

        test.case("orbits the fleet around its current location", check => {
            let mapview = testgame.view;
            let fleet = mapview.player_fleet;

            fleet.loopOrbit();
            check.equals(fleet.rotation, 0);

            mapview.game.tweens.update();
            let tween = first(mapview.game.tweens.getAll(), tw => tw.target == fleet);
            if (tween) {
                let tweendata = tween.generateData(0.1);
                check.equals(tweendata.length, 3);
                check.nears(tweendata[0].rotation, -Math.PI * 2 / 3);
                check.nears(tweendata[1].rotation, -Math.PI * 4 / 3);
                check.nears(tweendata[2].rotation, -Math.PI * 2);
            } else {
                check.fail("No tween found");
            }
        });
    });
}
