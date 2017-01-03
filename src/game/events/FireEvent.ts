/// <reference path="BaseLogEvent.ts"/>

module SpaceTac.Game {
    // Event logged when a weapon is used on a target
    export class FireEvent extends BaseLogEvent {
        // Weapon used
        weapon: Equipment;

        constructor(ship: Ship, weapon: Equipment, target: Target) {
            super("fire", ship, target);

            this.weapon = weapon;
        }
    }
}
