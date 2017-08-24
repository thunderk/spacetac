module TS.SpaceTac.UI.Specs {
    describe("ValueBar", function () {
        let testgame = setupEmptyView();

        it("computes proportional value", function () {
            var bar = new ValueBar(testgame.baseview, "default", ValueBarOrientation.EAST);
            expect(bar.getProportionalValue()).toBe(0);

            bar.setValue(20, 100);
            expect(bar.getProportionalValue()).toBeCloseTo(0.2, 0.000001);

            bar.setValue(40);
            expect(bar.getProportionalValue()).toBeCloseTo(0.4, 0.000001);

            bar.setValue(0, 0);
            expect(bar.getProportionalValue()).toBe(0);
        });
    });
}
