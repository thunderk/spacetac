module TS.SpaceTac {
    // Action to end the ship's turn
    export class EndTurnAction extends BaseAction {
        constructor() {
            super("endturn", "End ship's turn", false);
        }

        protected customApply(battle: Battle, ship: Ship, target: Target): boolean {
            ship.endTurn();
            battle.advanceToNextShip();
            return true;
        }
    }
}
