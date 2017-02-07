/// <reference path="BaseEffect.ts"/>

module TS.SpaceTac.Game {
    /**
     * Apply damage on a ship.
     * 
     * Damage is applied on shield while there is some, then on the hull.
     */
    export class DamageEffect extends BaseEffect {
        // Base damage points
        value: number;

        constructor(value: number) {
            super("damage");

            this.value = value;
        }

        applyOnShip(ship: Ship): boolean {
            var damage = this.value;
            var hull: number;
            var shield: number;

            // Apply on shields
            if (damage >= ship.values.shield.get()) {
                shield = ship.values.shield.get();
            } else {
                shield = damage;
            }
            damage -= shield;

            // Apply on hull
            if (damage >= ship.values.hull.get()) {
                hull = ship.values.hull.get();
            } else {
                hull = damage;
            }

            // Effective damages on ship
            ship.addDamage(hull, shield);

            return true;
        }

        getDescription(): string {
            return `${this.value} damage`;
        }
    }
}
