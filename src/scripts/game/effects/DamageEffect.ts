/// <reference path="BaseEffect.ts"/>

module SpaceTac.Game {
    "use strict";

    // Apply damage to a ship
    export class DamageEffect extends BaseEffect {
        // Base damage points
        value: number;

        constructor(value: number) {
            super("damage");

            this.value = value;
        }

        applyOnShip(ship: Ship): boolean {
            // TODO
            return true;
        }
    }
}
