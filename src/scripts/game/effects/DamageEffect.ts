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
            var damage = this.value;

            // Apply on shields
            var absorbed = ship.shield.current;
            if (damage >= ship.shield.current) {
                ship.setAttribute(ship.shield, 0);
            } else {
                ship.setAttribute(ship.shield, -damage, true);
            }
            damage -= absorbed;

            // Apply on hull
            if (damage >= ship.hull.current) {
                ship.setAttribute(ship.hull, 0);
            } else {
                ship.setAttribute(ship.hull, -damage, true);
            }

            return true;
        }
    }
}
