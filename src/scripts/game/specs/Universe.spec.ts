/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game.Specs {
    "use strict";

    function applyGameSteps(universe: Universe): void {
        universe.battle.advanceToNextShip();
        // TODO Make some moves (IA?)
        universe.battle.endBattle(universe.battle.fleets[0]);
    }

    describe("Universe", () => {
        it("serializes to a string", () => {
            var universe = new Universe();
            universe.startQuickBattle(false);

            // Dump and reload
            var dumped = universe.saveToString();
            var loaded_universe = Universe.loadFromString(dumped);

            // Check equality
            expect(loaded_universe).toEqual(universe);

            // Apply game steps
            applyGameSteps(universe);
            applyGameSteps(loaded_universe);

            // Clean stored times as they might differ
            var clean = (u: Universe) => {
                u.battle.fleets.forEach((fleet: Fleet) => {
                    if (fleet.player.ai) {
                        fleet.player.ai.started = 0;
                    }
                });
            };
            clean(universe);
            clean(loaded_universe);

            // Check equality after game steps
            expect(loaded_universe).toEqual(universe);
        });
    });
}
