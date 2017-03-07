module TS.SpaceTac {
    // Action to end the ship's turn
    export class EndTurnAction extends BaseAction {
        constructor() {
            super("endturn", "End ship's turn", false);
        }

        protected customApply(ship: Ship, target: Target) {
            ship.endTurn();

            let battle = ship.getBattle();
            if (battle) {
                battle.advanceToNextShip();
            }
        }
    }
}
