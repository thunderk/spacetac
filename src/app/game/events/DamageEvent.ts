/// <reference path="BaseLogEvent.ts"/>

module SpaceTac.Game {
    "use strict";

    // Event logged when a ship takes damage
    export class DamageEvent extends BaseLogEvent {
        // Damage to hull
        hull: number;

        // Damage to shield
        shield: number;

        constructor(ship: Ship, hull: number, shield: number) {
            super("damage", ship);

            this.hull = hull;
            this.shield = shield;
        }
    }
}
