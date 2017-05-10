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
            var battle = nn(session.getBattle());
            battle.advanceToNextShip();
            // TODO Make some fixed moves (AI?)
            battle.endBattle(battle.fleets[0]);
        }

        it("serializes to a string", function () {
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

        it("applies battle outcome to bound player", function () {
            let session = new GameSession();
            expect(session.getBattle()).toBeNull();

            // Victory case
            let location1 = new StarLocation();
            location1.encounter = new Fleet();
            session.player.fleet.setLocation(location1);
            expect(session.getBattle()).not.toBeNull();
            expect(location1.encounter).not.toBeNull();

            let battle = nn(session.getBattle());
            battle.endBattle(session.player.fleet);
            let spyloot = spyOn(battle.outcome, "createLoot").and.stub();
            session.setBattleEnded();
            expect(session.getBattle()).not.toBeNull();
            expect(location1.encounter).toBeNull();
            expect(spyloot).toHaveBeenCalledTimes(1);

            // Defeat case
            let location2 = new StarLocation(location1.star);
            location2.encounter = new Fleet();
            session.player.fleet.setLocation(location2);
            expect(session.getBattle()).not.toBeNull();
            expect(location2.encounter).not.toBeNull();

            battle = nn(session.getBattle());
            battle.endBattle(null);
            spyloot = spyOn(battle.outcome, "createLoot").and.stub();
            session.setBattleEnded();
            expect(session.getBattle()).not.toBeNull();
            expect(location2.encounter).not.toBeNull();
            expect(spyloot).toHaveBeenCalledTimes(0);
        });

        it("generates a new campaign", function () {
            let session = new GameSession();

            session.startNewGame();
            expect(session.player).not.toBeNull();
            expect(session.player.fleet.ships.length).toBe(3);
            expect(session.player.fleet.credits).toBe(500);
            expect(session.player.universe.stars.length).toBe(50);
            expect(session.getBattle()).toBeNull();
            let start_location = nn(session.player.fleet.location);
            expect(start_location.shop).not.toBeNull();
            expect(nn(start_location.shop).getStock().length).toBeGreaterThan(20);
            expect(start_location.encounter).toBeNull();
            expect(start_location.encounter_gen).toBe(true);
        });
    });
}
