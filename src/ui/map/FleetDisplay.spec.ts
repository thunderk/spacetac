module TK.SpaceTac.UI.Specs {
    describe("FleetDisplay", function () {
        let testgame = setupMapview();

        it("orbits the fleet around its current location", function () {
            let mapview = testgame.mapview;
            let fleet = mapview.player_fleet;

            fleet.loopOrbit();
            expect(fleet.rotation).toBe(0);

            mapview.game.tweens.update();
            let tween = first(mapview.game.tweens.getAll(), tw => tw.target == fleet);
            if (tween) {
                let tweendata = tween.generateData(0.1);
                expect(tweendata.length).toEqual(3);
                expect(tweendata[0].rotation).toBeCloseTo(-Math.PI * 2 / 3);
                expect(tweendata[1].rotation).toBeCloseTo(-Math.PI * 4 / 3);
                expect(tweendata[2].rotation).toBeCloseTo(-Math.PI * 2);
            } else {
                fail("No tween found");
            }
        });
    });
}
