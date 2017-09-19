module TS.SpaceTac {
    // Action to end the ship's turn
    export class EndTurnAction extends BaseAction {
        constructor() {
            super("endturn", "End ship's turn");
        }

        protected customApply(ship: Ship, target: Target) {
            if (target.ship == ship) {
                ship.endTurn();

                let battle = ship.getBattle();
                if (battle) {
                    battle.advanceToNextShip();
                }
            }
        }

        protected checkShipTarget(ship: Ship, target: Target): Target | null {
            return target.ship == ship ? target : null;
        }

        getTargettingMode(ship: Ship): ActionTargettingMode {
            return ship.getValue("power") ? ActionTargettingMode.SELF_CONFIRM : ActionTargettingMode.SELF;
        }
            
        getEffectsDescription(): string {
            return "End the current ship's turn.\nWill also generate power and cool down equipments.";
        }
    }
}
