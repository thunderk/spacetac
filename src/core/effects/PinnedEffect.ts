/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    /**
     * Pin a ship in space, preventing him from moving using its engine
     * 
     * If hard pinned, the ship also may not be moved by another MoveEffect
     */
    export class PinnedEffect extends BaseEffect {
        constructor(readonly hard = false) {
            super("pinned");
        }

        isBeneficial(): boolean {
            return false;
        }

        getDescription(): string {
            return this.hard ? "anchored" : "pinned";
        }
    }
}
