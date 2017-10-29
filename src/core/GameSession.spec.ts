module TK.SpaceTac.Specs {
    testing("GameSession", test => {
        /**
         * Compare two sessions
         */
        function compare(session1: GameSession, session2: GameSession) {
            test.check.equals(session1, session2);
        }

        /**
         * Apply deterministic game steps
         */
        function applyGameSteps(session: GameSession): void {
            var battle = nn(session.getBattle());
            battle.advanceToNextShip();
            // TODO Make some fixed moves (AI?)
            battle.endBattle(battle.fleets[0]);
        }

        test.case("serializes to a string", check => {
            var session = new GameSession();
            session.startQuickBattle();

            // Dump and reload
            var dumped = session.saveToString();
            var loaded_session = GameSession.loadFromString(dumped);

            // Check equality
            compare(loaded_session, session);

            // Apply game steps
            applyGameSteps(session);
            applyGameSteps(loaded_session);

            // Check equality after game steps
            compare(loaded_session, session);
        });

        test.case("applies battle outcome to bound player", check => {
            let session = new GameSession();
            check.equals(session.getBattle(), null);

            // Victory case
            let location1 = new StarLocation();
            location1.encounter = new Fleet();
            session.player.fleet.setLocation(location1);
            check.notequals(session.getBattle(), null);
            check.notequals(location1.encounter, null);

            let battle = nn(session.getBattle());
            battle.endBattle(session.player.fleet);
            let spyloot = check.patch(battle.outcome, "createLoot", null);
            session.setBattleEnded();
            check.notequals(session.getBattle(), null);
            check.equals(location1.encounter, null);
            check.called(spyloot, 1);

            // Defeat case
            let location2 = new StarLocation(location1.star);
            location2.encounter = new Fleet();
            session.player.fleet.setLocation(location2);
            check.notequals(session.getBattle(), null);
            check.notequals(location2.encounter, null);

            battle = nn(session.getBattle());
            battle.endBattle(null);
            spyloot = check.patch(battle.outcome, "createLoot", null);
            session.setBattleEnded();
            check.notequals(session.getBattle(), null);
            check.notequals(location2.encounter, null);
            check.called(spyloot, 0);
        });

        test.case("generates a new campaign", check => {
            let session = new GameSession();

            session.startNewGame(false);
            check.notequals(session.player, null);
            check.equals(session.player.fleet.ships.length, 0);
            check.equals(session.player.fleet.credits, 0);
            check.equals(session.player.universe.stars.length, 50);
            check.equals(session.getBattle(), null);
            check.equals(session.start_location.shop, null);
            check.equals(session.start_location.encounter, null);
            check.equals(session.start_location.encounter_gen, true);

            session.setCampaignFleet();
            check.equals(session.player.fleet.ships.length, 2);
            check.equals(session.player.fleet.credits, 0);
            check.same(session.player.fleet.location, session.start_location);
        });

        /*test.case("can generate lots of new games", check => {
            range(20).forEach(() => {
                let session = new GameSession();
                session.startNewGame();
                check.equals(session.universe.stars.length, 50);
            });
        });*/
    });
}
