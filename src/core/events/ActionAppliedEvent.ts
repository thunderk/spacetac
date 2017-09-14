/// <reference path="BaseBattleEvent.ts"/>

module TS.SpaceTac {
    /**
     * Event logged when an action is used.
     */
    export class ActionAppliedEvent extends BaseLogShipEvent {
        // Action applied
        action: BaseAction

        // Power usage
        power: number

        constructor(ship: Ship, action: BaseAction, target: Target | null, power: number) {
            super("action", ship, target);

            this.action = action;
            this.power = power;
        }
    }
}
