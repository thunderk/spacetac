/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    /**
     * Mode for damage effect
     */
    export enum DamageEffectMode {
        // Apply on shield only
        SHIELD_ONLY,
        // Apply on shield, then remaining value on hull
        SHIELD_THEN_HULL,
        // Apply on shield only if up, otherwise on hull
        SHIELD_OR_HULL,
        // Apply on hull only
        HULL_ONLY
    }

    /**
     * Apply damage on a ship.
     */
    export class DamageEffect extends BaseEffect {
        // Damage amount
        value: number

        // Damage mode
        mode: DamageEffectMode

        constructor(value: number, mode = DamageEffectMode.SHIELD_OR_HULL) {
            super("damage");

            this.value = value;
            this.mode = mode;
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
            let shield = ship.getValue("shield");
            let hull = ship.getValue("hull");
            let dhull = 0;
            let dshield = 0;

            // Apply modifiers
            let damage = Math.round(this.value * this.getFactor(ship));

            // Split in shield/hull damage
            if (this.mode == DamageEffectMode.HULL_ONLY) {
                dhull = Math.min(damage, hull);
            } else if (this.mode == DamageEffectMode.SHIELD_ONLY) {
                dshield = Math.min(damage, shield);
            } else if (this.mode == DamageEffectMode.SHIELD_OR_HULL) {
                if (shield) {
                    dshield = Math.min(damage, shield);
                } else {
                    dhull = Math.min(damage, hull);
                }
            } else {
                dshield = Math.min(damage, shield);
                dhull = Math.min(damage - dshield, hull);
            }

            return new ShipDamageDiff(ship, dhull, dshield, damage);
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
            let mode = "";
            if (this.mode == DamageEffectMode.HULL_ONLY) {
                mode = " hull";
            } else if (this.mode == DamageEffectMode.SHIELD_ONLY) {
                mode = " shield";
            } else if (this.mode == DamageEffectMode.SHIELD_THEN_HULL) {
                mode = " piercing";
            }

            return `do ${this.value}${mode} damage`;
        }
    }
}
