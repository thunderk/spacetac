module TS.SpaceTac.Specs {
    describe("StarLocation", () => {
        it("removes generated encounters that lose", function () {
            var location = new StarLocation(undefined, StarLocationType.PLANET, 0, 0);
            var fleet = new Fleet();
            location.encounter_random = new SkewedRandomGenerator([0]);
            var battle = location.enterLocation(fleet);

            expect(location.encounter).not.toBeNull();
            expect(battle).not.toBeNull();

            nn(battle).endBattle(fleet);

            expect(location.encounter).toBeNull();
        });

        it("leaves generated encounters that win", function () {
            var location = new StarLocation(undefined, StarLocationType.PLANET, 0, 0);
            var fleet = new Fleet();
            location.encounter_random = new SkewedRandomGenerator([0]);
            var battle = location.enterLocation(fleet);

            expect(location.encounter).not.toBeNull();
            expect(battle).not.toBeNull();

            nn(battle).endBattle(location.encounter);

            expect(location.encounter).not.toBeNull();
        });
    });
}
