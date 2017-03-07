module TS.SpaceTac.Specs {
    describe("EndTurnAction", () => {
        it("can't be applied to non-playing ship", () => {
            spyOn(console, "warn").and.stub();

            var battle = Battle.newQuickRandom();
            var action = new EndTurnAction();

            expect(action.checkCannotBeApplied(battle.play_order[0])).toBe(null);
            expect(action.checkCannotBeApplied(battle.play_order[1])).toBe("ship not playing");

            var result = action.apply(battle.play_order[1], null);
            expect(result).toBe(false);

            expect(console.warn).toHaveBeenCalledWith("Action rejected - ship not playing", battle.play_order[1], action, null);
        });

        it("ends turn when applied", () => {
            var battle = Battle.newQuickRandom();
            var action = new EndTurnAction();

            expect(battle.playing_ship_index).toBe(0);

            var result = action.apply(battle.play_order[0], null);
            expect(result).toBe(true);
            expect(battle.playing_ship_index).toBe(1);
        });
    });
}
