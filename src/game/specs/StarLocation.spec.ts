module SpaceTac.Game.Specs {
    "use strict";

    describe("StarLocation", () => {
        it("removes generated encounters that lose", function () {
            var location = new StarLocation(null, StarLocationType.PLANET, 0, 0);
            var fleet = new Fleet();
            var random = new RandomGenerator(0);
            var battle = location.enterLocation(fleet, random);

            expect(location.encounter).not.toBeNull();
            expect(battle).not.toBeNull();

            battle.endBattle(fleet);

            expect(location.encounter).toBeNull();
        });

        it("leaves generated encounters that win", function () {
            var location = new StarLocation(null, StarLocationType.PLANET, 0, 0);
            var fleet = new Fleet();
            var random = new RandomGenerator(0);
            var battle = location.enterLocation(fleet, random);

            expect(location.encounter).not.toBeNull();
            expect(battle).not.toBeNull();

            battle.endBattle(location.encounter);

            expect(location.encounter).not.toBeNull();
        });
    });
}
