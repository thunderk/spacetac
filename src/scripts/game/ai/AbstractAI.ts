module SpaceTac.Game.AI {
    "use strict";

    // Base class for all Artificial Intelligence interaction
    export class AbstractAI {
        // The battle this AI is involved in
        battle: Battle;

        // The fleet controlled by this AI
        fleet: Fleet;

        constructor(fleet: Fleet) {
            this.fleet = fleet;
            this.battle = fleet.battle;
        }
    }
}
