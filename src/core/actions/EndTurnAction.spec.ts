module TK.SpaceTac.Specs {
    testing("EndTurnAction", test => {
        test.case("can't be applied to non-playing ship", check => {
            let battle = new Battle();
            battle.fleets[0].addShip();
            battle.fleets[0].addShip();
            battle.throwInitiative();
            battle.setPlayingShip(battle.play_order[0]);

            let action = new EndTurnAction();
            check.equals(action.checkCannotBeApplied(battle.play_order[0]), null);
            check.equals(action.checkCannotBeApplied(battle.play_order[1]), "ship not playing");
        });

        test.case("ends turn when applied", check => {
            let battle = TestTools.createBattle(2, 0);

            TestTools.actionChain(check, battle, [
                [battle.play_order[0], EndTurnAction.SINGLETON, undefined],
            ], [
                    check => {
                        check.equals(battle.play_index, 0, "play_index is 0");
                        check.same(battle.playing_ship, battle.play_order[0], "first ship is playing");
                        check.equals(battle.play_order[0].playing, true, "first ship is playing");
                        check.equals(battle.play_order[1].playing, false, "second ship is not playing");
                    },
                    check => {
                        check.equals(battle.play_index, 1, "play_index is 1");
                        check.same(battle.playing_ship, battle.play_order[1], "second ship is playing");
                        check.equals(battle.play_order[0].playing, false, "first ship is not playing");
                        check.equals(battle.play_order[1].playing, true, "second ship is playing");
                    }
                ]);
        });

        test.case("generates power for previous ship", check => {
            check.patch(console, "warn", null);

            let battle = TestTools.createBattle(1, 0);
            let ship = battle.play_order[0];
            TestTools.setShipAP(ship, 10, 3);
            ship.setValue("power", 6);

            TestTools.actionChain(check, battle, [
                [ship, EndTurnAction.SINGLETON, Target.newFromShip(ship)],
                [ship, EndTurnAction.SINGLETON, Target.newFromShip(ship)],
                [ship, EndTurnAction.SINGLETON, Target.newFromShip(ship)],
            ], [
                    check => {
                        check.equals(ship.getValue("power"), 6, "power=6");
                    },
                    check => {
                        check.equals(ship.getValue("power"), 9, "power=9");
                    },
                    check => {
                        check.equals(ship.getValue("power"), 10, "power=10");
                    },
                    check => {
                        check.equals(ship.getValue("power"), 10, "power=10");
                    }
                ]);
        });
    });
}
