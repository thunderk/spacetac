module SpaceTac.Game {
    "use strict";

    // Action to end the ship's turn
    export class EndTurnAction extends BaseAction {
        constructor() {
            super("endturn", false);
        }

        protected customApply(battle: Battle, ship: Ship, target: Target): boolean {
            ship.endTurn();
            battle.advanceToNextShip();
            return true;
        }
    }
}
