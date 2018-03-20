/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    /**
     * Apply damage on a ship.
     * 
     * Damage is applied on shield while there is some, then on the hull.
     */
    export class DamageEffect extends BaseEffect {
        // Base damage points
        value: number

        constructor(value = 0) {
            super("damage");

            this.value = value;
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
        getEffectiveDamage(ship: Ship): ShipDamageDiff {
            // Apply modifiers
            let theoritical = Math.round(this.value * this.getFactor(ship));
            let damage = theoritical;

            // Apply on shields
            let shield = (damage >= ship.getValue("shield")) ? ship.getValue("shield") : damage;
            damage -= shield;

            // Apply on hull
            let hull = (damage >= ship.getValue("hull")) ? ship.getValue("hull") : damage;

            return new ShipDamageDiff(ship, hull, shield, theoritical);
        }

        getOnDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [];

            let damage = this.getEffectiveDamage(ship);

            if (damage.shield || damage.hull) {
                result.push(damage);
            }

            if (damage.shield) {
                result.push(new ShipValueDiff(ship, "shield", -damage.shield));
            }

            if (damage.hull) {
                result.push(new ShipValueDiff(ship, "hull", -damage.hull));
            }

            return result;
        }

        getDescription(): string {
            return `do ${this.value} damage`;
        }
    }
}
