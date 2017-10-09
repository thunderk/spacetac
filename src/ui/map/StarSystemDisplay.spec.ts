module TK.SpaceTac.UI.Specs {
    describe("StarSystemDisplay", function () {
        let testgame = setupMapview();

        it("displays a badge with the current state for a star location", function () {
            let mapview = testgame.view;
            let location = nn(mapview.player.fleet.location);

            let ssdisplay = nn(first(mapview.starsystems, ss => ss.starsystem == location.star));

            let ldisplay = nn(first(ssdisplay.locations, loc => loc[0] != location));
            expect(ldisplay[2].name).toEqual("map-status-unvisited");

            ldisplay[0].setupEncounter();
            ssdisplay.updateInfo(2, true);
            expect(ldisplay[2].name).toEqual("map-status-unvisited");

            mapview.player.setVisited(ldisplay[0]);
            ssdisplay.updateInfo(2, true);
            expect(ldisplay[2].name).toEqual("map-status-enemy");

            ldisplay[0].shop = null;
            ldisplay[0].clearEncounter();
            ssdisplay.updateInfo(2, true);
            expect(ldisplay[2].name).toEqual("map-status-clear");

            ldisplay[0].shop = new Shop();
            ssdisplay.updateInfo(2, true);
            expect(ldisplay[2].name).toEqual("map-status-dockyard");
        });
    });
}
