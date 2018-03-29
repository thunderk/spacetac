/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A vigilance reaction has been triggered
     * 
     * This does not do anything, and is just there for animations
     */
    export class VigilanceAppliedDiff extends BaseBattleShipDiff {
        action: RObjectId
        target: RObjectId

        constructor(source: Ship, action: VigilanceAction, target: Ship) {
            super(source);

            this.action = action.id;
            this.target = target.id;
        }
    }
}
