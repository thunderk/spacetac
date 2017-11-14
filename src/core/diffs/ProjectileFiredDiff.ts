/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A projectile is fired
     * 
     * This does not do anything, and is just there for animations
     */
    export class ProjectileFiredDiff extends BaseBattleShipDiff {
        equipment: RObjectId
        target: Target

        constructor(ship: Ship, equipment: Equipment, target: Target) {
            super(ship);

            this.equipment = equipment.id;
            this.target = target;
        }
    }
}
