/// <reference path="BaseBattleEvent.ts"/>

module TS.SpaceTac {
    /**
     * Event logged when an action is used.
     */
    export class ActionAppliedEvent extends BaseLogShipEvent {
        // Action applied
        action: BaseAction

        constructor(ship: Ship, action: BaseAction, target: Target | null) {
            super("action", ship, target);

            this.action = action;
        }
    }
}
