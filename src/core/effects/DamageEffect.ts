/// <reference path="BaseEffect.ts"/>

module TS.SpaceTac {
    /**
     * Apply damage on a ship.
     * 
     * Damage is applied on shield while there is some, then on the hull.
     */
    export class DamageEffect extends BaseEffect {
        // Base damage points
        base: number;

        // Range of randomness (effective damage will be between *value* and *value+range*)
        span: number;

        constructor(value = 0, span = 0) {
            super("damage");

            this.base = value;
            this.span = span;
        }

        /**
         * Apply damage modifiers to get the final damage factor
         */
        getFactor(ship: Ship): number {
            let percent = 0;
            iforeach(ship.ieffects(), effect => {
                if (effect instanceof DamageModifierEffect) {
                    percent += effect.factor;
                }
            });
            return (clamp(percent, -100, 100) + 100) / 100;
        }

        /**
         * Get the effective damage done to both shield and hull (in this order)
         */
        getEffectiveDamage(ship: Ship): [number, number] {
            var damage = (this.span > 0) ? RandomGenerator.global.randInt(this.base, this.base + this.span) : this.base;
            var hull: number;
            var shield: number;

            // Apply modifiers
            damage = Math.round(damage * this.getFactor(ship));

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

        applyOnShip(ship: Ship, source: Ship | Drone): boolean {
            let [shield, hull] = this.getEffectiveDamage(ship);

            ship.addDamage(hull, shield);

            if (shield > 0) {
                ship.listEquipment(SlotType.Shield).forEach(equipment => equipment.addWear(Math.ceil(shield * 0.01)));
            }
            if (hull > 0) {
                ship.listEquipment(SlotType.Hull).forEach(equipment => equipment.addWear(Math.ceil(hull * 0.01)));
            }

            return true;
        }

        getDescription(): string {
            if (this.span > 0) {
                return `do ${this.base}-${this.base + this.span} damage`;
            } else {
                return `do ${this.base} damage`;
            }
        }
    }
}
