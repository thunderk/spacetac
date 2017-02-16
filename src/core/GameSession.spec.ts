module TS.SpaceTac.Specs {
    describe("GameSession", () => {
        /**
         * Compare two sessions
         */
        function compare(session1: GameSession, session2: GameSession) {
            expect(session1).toEqual(session2);

        }

        /**
         * Apply deterministic game steps
         */
        function applyGameSteps(session: GameSession): void {
            var battle = session.getBattle();
            battle.advanceToNextShip();
            // TODO Make some fixed moves (AI?)
            battle.endBattle(battle.fleets[0]);
        }

        it("serializes to a string", () => {
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
    });
}
