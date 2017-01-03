module SpaceTac.Game.Specs {
    describe("EndTurnAction", () => {
        it("can't be applied to non-playing ship", () => {
            var battle = Battle.newQuickRandom();
            var action = new EndTurnAction();

            expect(action.canBeUsed(battle, battle.play_order[0])).toBe(true);
            expect(action.canBeUsed(battle, battle.play_order[1])).toBe(false);

            var result = action.apply(battle, battle.play_order[1], null);
            expect(result).toBe(false);
        });

        it("ends turn when applied", () => {
            var battle = Battle.newQuickRandom();
            var action = new EndTurnAction();

            expect(battle.playing_ship_index).toBe(0);

            var result = action.apply(battle, battle.play_order[0], null);
            expect(result).toBe(true);
            expect(battle.playing_ship_index).toBe(1);
        });
    });
}
