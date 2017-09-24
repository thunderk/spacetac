module TK.SpaceTac.UI.Specs {
    describe("StarSystemDisplay", function () {
        let testgame = setupMapview();

        it("displays a badge with the current state for a star location", function () {
            let mapview = testgame.mapview;
            let location = nn(mapview.player.fleet.location);

            let ssdisplay = nn(first(mapview.starsystems, ss => ss.starsystem == location.star));
            let l1display = nn(first(ssdisplay.locations, loc => loc[0] == location));
            expect(l1display[2].name).toEqual("map-status-dockyard");

            let l2display = nn(first(ssdisplay.locations, loc => loc[0] != location));
            expect(l2display[2].name).toEqual("map-status-unvisited");

            l2display[0].setupEncounter();
            ssdisplay.updateInfo(2, true);
            expect(l2display[2].name).toEqual("map-status-unvisited");

            mapview.player.setVisited(l2display[0]);
            ssdisplay.updateInfo(2, true);
            expect(l2display[2].name).toEqual("map-status-enemy");

            l2display[0].shop = null;
            l2display[0].clearEncounter();
            ssdisplay.updateInfo(2, true);
            expect(l2display[2].name).toEqual("map-status-clear");
        });
    });
}
