/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A ship action is fully ended
     * 
     * This does not do anything, it is just used to mark the effective end of the action diffs (battle checks included)
     */
    export class ShipActionEndedDiff extends BaseBattleShipDiff {
        // Action applied
        action: RObjectId

        // Target for the action
        target: Target

        constructor(ship: Ship, action: BaseAction, target: Target) {
            super(ship);

            this.action = action.id;
            this.target = target;
        }
    }
}
