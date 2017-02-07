module TS.SpaceTac.Game.Specs {
    function applyGameSteps(session: GameSession): void {
        var battle = session.getBattle();
        battle.advanceToNextShip();
        // TODO Make some moves (AI?)
        battle.endBattle(battle.fleets[0]);
    }

    /*describe("GameSession", () => {
        it("serializes to a string", () => {
            var session = new GameSession();
            session.startQuickBattle(true);
            // TODO AI sometimes starts playing in background...

            // Dump and reload
            var dumped = session.saveToString();
            var loaded_session = GameSession.loadFromString(dumped);

            // Check equality
            expect(loaded_session).toEqual(session);

            // Apply game steps
            applyGameSteps(session);
            applyGameSteps(loaded_session);

            // Clean stored times as they might differ
            var clean = (session: GameSession) => {
                session.getBattle().fleets.forEach((fleet: Fleet) => {
                    if (fleet.player.ai) {
                        fleet.player.ai.started = 0;
                    }
                });
            };
            clean(session);
            clean(loaded_session);

            // Check equality after game steps
            expect(loaded_session).toEqual(session);
        });
    });*/
}
