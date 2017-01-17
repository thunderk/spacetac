/// <reference path="BaseEffect.ts"/>

module SpaceTac.Game {
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
            var hull: number;
            var shield: number;

            // Apply on shields
            if (damage >= ship.shield.current) {
                shield = ship.shield.current;
            } else {
                shield = damage;
            }
            damage -= shield;

            // Apply on hull
            if (damage >= ship.hull.current) {
                hull = ship.hull.current;
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
