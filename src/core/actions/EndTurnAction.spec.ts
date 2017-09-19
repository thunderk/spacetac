module TS.SpaceTac.Specs {
    describe("EndTurnAction", () => {
        it("can't be applied to non-playing ship", () => {
            spyOn(console, "warn").and.stub();

            let battle = Battle.newQuickRandom();
            let action = new EndTurnAction();

            expect(action.checkCannotBeApplied(battle.play_order[0])).toBe(null);
            expect(action.checkCannotBeApplied(battle.play_order[1])).toBe("ship not playing");

            let ship = battle.play_order[1];
            let result = action.apply(battle.play_order[1]);
            expect(result).toBe(false);

            expect(console.warn).toHaveBeenCalledWith("Action rejected - ship not playing", ship, action, Target.newFromShip(ship));
        });

        it("ends turn when applied", () => {
            let battle = Battle.newQuickRandom();
            let action = new EndTurnAction();

            expect(battle.playing_ship_index).toBe(0);

            let result = action.apply(battle.play_order[0], Target.newFromShip(battle.play_order[0]));
            expect(result).toBe(true);
            expect(battle.playing_ship_index).toBe(1);
        });
    });
}
