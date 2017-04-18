/// <reference path="BaseEffect.ts"/>

module TS.SpaceTac {
    /**
     * Apply damage on a ship.
     * 
     * Damage is applied on shield while there is some, then on the hull.
     */
    export class DamageEffect extends BaseEffect {
        // Base damage points
        value: number;

        constructor(value: number = 0) {
            super("damage");

            this.value = value;
        }

        /**
         * Get the effective damage done to both shield and hull (in this order)
         */
        getEffectiveDamage(ship: Ship): [number, number] {
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

            return [shield, hull];
        }

        applyOnShip(ship: Ship): boolean {
            let [shield, hull] = this.getEffectiveDamage(ship);
            ship.addDamage(hull, shield);

            return true;
        }

        getDescription(): string {
            return `do ${this.value} damage`;
        }
    }
}
