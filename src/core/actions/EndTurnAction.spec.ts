module TK.SpaceTac.Specs {
    testing("EndTurnAction", test => {
        test.case("can't be applied to non-playing ship", check => {
            let mock_warn = check.patch(console, "warn", null);

            let battle = Battle.newQuickRandom();
            let action = new EndTurnAction();

            check.equals(action.checkCannotBeApplied(battle.play_order[0]), null);
            check.equals(action.checkCannotBeApplied(battle.play_order[1]), "ship not playing");

            let ship = battle.play_order[1];
            let result = action.apply(battle.play_order[1]);
            check.equals(result, false);
            check.called(mock_warn, [
                ["Action rejected - ship not playing", ship, action, Target.newFromShip(ship)]
            ]);
        });

        test.case("ends turn when applied", check => {
            let battle = Battle.newQuickRandom();
            let action = new EndTurnAction();

            check.equals(battle.play_index, 0);

            let result = action.apply(battle.play_order[0], Target.newFromShip(battle.play_order[0]));
            check.equals(result, true);
            check.equals(battle.play_index, 1);
        });
    });
}
