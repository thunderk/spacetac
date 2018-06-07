module TK.SpaceTac.UI.Specs {
    testing("FleetDisplay", test => {
        let testgame = setupEmptyView(test);

        test.case("orbits the fleet around its current location", check => {
            let session = new GameSession();
            session.startNewGame(true, false);
            let fleet = new FleetDisplay(testgame.view, session.player.fleet, session.universe, undefined, false);

            fleet.loopOrbit();
            check.equals(fleet.rotation, 0);

            checkTween(testgame, fleet, "rotation", [0, -Math.PI * 2 / 3, Math.PI * 2 / 3, 0]);
        });

        test.case("animates jumps between locations", check => {
            let session = new GameSession();
            session.startNewGame(true, false);
            let fleet_disp = new FleetDisplay(testgame.view, session.player.fleet, session.universe, undefined, false);

            let on_leave = check.mockfunc("on_leave", (duration: number): any => null);
            let on_finished = check.mockfunc();

            let current = nn(session.universe.getLocation(session.player.fleet.location));
            let dest = nn(first(current.star.locations, loc => loc !== current));
            dest.universe_x = current.universe_x - 0.1;
            dest.universe_y = current.universe_y;
            dest.clearEncounter();
            fleet_disp.moveToLocation(dest, 1, on_leave.func, on_finished.func);
            check.called(on_leave, 0);
            check.called(on_finished, 0);
            checkTween(testgame, fleet_disp, "rotation", [
                0,
                -0.0436332312998573,
                -0.3490658503988655,
                -1.178097245096172,
                -2.7925268031909276,
                0.8290313946973056,
                -3.141592653589793
            ]);
        });
    });
}
