/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A ship uses an action
     * 
     * This will change:
     * - The cooldown on the action and/or equipment
     * - The wearing down of the equipment
     */
    export class ShipActionUsedDiff extends BaseBattleShipDiff {
        // Action applied
        action: RObjectId

        // Target for the action
        target: Target

        constructor(ship: Ship, action: BaseAction, target: Target) {
            super(ship);

            this.action = action.id;
            this.target = target;
        }

        protected applyOnShip(ship: Ship, battle: Battle): void {
            let action = ship.actions.getById(this.action);

            if (!action) {
                console.error("Action failed - not found on ship", this, ship);
                return;
            }

            if (ship.actions.isUsable(action)) {
                ship.actions.storeUsage(action, 1);
            } else {
                console.error("Action apply failed - in cooldown", this, ship);
                return;
            }
        }

        protected revertOnShip(ship: Ship, battle: Battle): void {
            let action = ship.actions.getById(this.action);

            if (!action) {
                console.error("Action revert failed - not found on ship", this, ship);
                return;
            }

            ship.actions.storeUsage(action, -1);
        }
    }
}
