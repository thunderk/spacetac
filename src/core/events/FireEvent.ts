/// <reference path="BaseBattleEvent.ts"/>

module TS.SpaceTac {
    // Event logged when a weapon is used on a target
    export class FireEvent extends BaseLogShipTargetEvent {
        // Weapon used
        weapon: Equipment;

        constructor(ship: Ship, weapon: Equipment, target: Target) {
            super("fire", ship, target);

            this.weapon = weapon;
        }
    }
}
