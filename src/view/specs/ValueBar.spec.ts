module SpaceTac.View.Specs {
    describe("ValueBar", () => {
        ingame_it("computes proportional value", (game: Phaser.Game) => {
            var bar = ValueBar.newStandard(game, 0, 0);

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
