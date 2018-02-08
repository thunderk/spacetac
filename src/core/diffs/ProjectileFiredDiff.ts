/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A projectile is fired
     * 
     * This does not do anything, and is just there for animations
     */
    export class ProjectileFiredDiff extends BaseBattleShipDiff {
        action: RObjectId
        target: Target

        constructor(ship: Ship, action: TriggerAction, target: Target) {
            super(ship);

            this.action = action.id;
            this.target = target;
        }
    }
}
