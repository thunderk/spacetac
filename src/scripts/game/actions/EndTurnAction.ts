module SpaceTac.Game {
    // Action to end the ship's turn
    export class EndTurnAction extends BaseAction {
        constructor() {
            super("endturn", false);
        }

        canBeUsed(battle: Battle, ship: Ship): boolean {
            return battle.playing_ship === ship;
        }

        protected customApply(battle: Battle, ship: Ship, target: Target): boolean {
            battle.advanceToNextShip();
            return true;
        }
    }
}