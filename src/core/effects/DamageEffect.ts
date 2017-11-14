/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
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
            if (damage >= ship.getValue("shield")) {
                shield = ship.getValue("shield");
            } else {
                shield = damage;
            }
            damage -= shield;

            // Apply on hull
            if (damage >= ship.getValue("hull")) {
                hull = ship.getValue("hull");
            } else {
                hull = damage;
            }

            return [shield, hull];
        }

        getOnDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            let [shield, hull] = this.getEffectiveDamage(ship);

            let result: BaseBattleDiff[] = [];

            if (shield || hull) {
                result.push(new ShipDamageDiff(ship, hull, shield));
            }

            if (shield) {
                result.push(new ShipValueDiff(ship, "shield", -shield));
            }

            if (hull) {
                result.push(new ShipValueDiff(ship, "hull", -hull));
            }

            return result;
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
