/// <reference path="BaseBattleEvent.ts"/>

module TK.SpaceTac {
    /**
     * Event logged when a toggle action is activated or deactivated
     */
    export class ToggleEvent extends BaseLogShipEvent {
        // Pointer to the action
        action: BaseAction

        // true for activation, false for deactivation
        activated: boolean

        constructor(ship: Ship, action: BaseAction, activated: boolean) {
            super("toggle", ship);

            this.action = action;
            this.activated = activated;
        }
    }
}
