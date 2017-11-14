/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A ship activated or deactivated a toggle action
     */
    export class ShipActionToggleDiff extends BaseBattleShipDiff {
        // Pointer to the action
        action: RObjectId

        // true for activation, false for deactivation
        activated: boolean

        constructor(ship: Ship | RObjectId, action: BaseAction | RObjectId, activated: boolean) {
            super(ship);

            this.action = (action instanceof BaseAction) ? action.id : action;
            this.activated = activated;
        }

        applyOnShip(ship: Ship, battle: Battle): void {
            let action = ship.getAction(this.action);
            if (action && action instanceof ToggleAction) {
                if (action.activated == this.activated) {
                    console.warn("Diff not applied - action already in good state", this, action);
                } else {
                    action.activated = this.activated;
                }
            } else {
                console.error("Diff not applied - action not found on ship", this, ship);
            }
        }

        getReverse(): BaseBattleDiff {
            return new ShipActionToggleDiff(this.ship_id, this.action, !this.activated);
        }
    }
}
