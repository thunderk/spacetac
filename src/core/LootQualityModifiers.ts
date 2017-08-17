module TS.SpaceTac {
    /**
     * Modifiers of basic loot, to obtain different quality levels
     */
    export class LootQualityModifiers {
        /**
         * Generic quality modifier
         */
        static applyStandard(equipment: Equipment, quality: EquipmentQuality, random: RandomGenerator): boolean {
            // Collect available modifiers
            let modifiers: Function[] = [];

            let factor = 1;
            if (quality == EquipmentQuality.WEAK) {
                factor = 0.8;
            } else if (quality == EquipmentQuality.FINE) {
                factor = 1.1;
            } else if (quality == EquipmentQuality.PREMIUM) {
                factor = 1.3;
            } else if (quality == EquipmentQuality.LEGENDARY) {
                factor = 1.6;
            }

            if (quality == EquipmentQuality.WEAK && any(values(equipment.requirements), value => value > 0)) {
                modifiers.push(() => {
                    iteritems(copy(equipment.requirements), (skill, value) => {
                        equipment.requirements[skill] = Math.max(equipment.requirements[skill] + 1, Math.floor(equipment.requirements[skill] / factor));
                    });
                });
            }

            function simpleFactor<T>(obj: T, attr: keyof T, inverse = false) {
                let val = <any>obj[attr];
                if (val && val != 0) {
                    let nval = Math.round((inverse ? (1 / factor) : factor) * val);
                    if (nval != val) {
                        modifiers.push(() => (<any>obj)[attr] = nval);
                    }
                }
            }

            function effectFactor(effect: BaseEffect) {
                if (effect instanceof ValueEffect || effect instanceof AttributeEffect) {
                    simpleFactor(effect, 'value');
                } else if (effect instanceof AttributeLimitEffect) {
                    simpleFactor(effect, 'value', true);
                } else if (effect instanceof StickyEffect) {
                    simpleFactor(effect, 'duration');
                    effectFactor(effect.base);
                } else if (effect instanceof DamageEffect) {
                    simpleFactor(effect, 'base');
                    simpleFactor(effect, 'span');
                } else if (effect instanceof RepelEffect) {
                    simpleFactor(effect, 'value');
                } else if (effect instanceof DamageModifierEffect) {
                    simpleFactor(effect, 'factor');
                } else if (effect instanceof ValueTransferEffect) {
                    simpleFactor(effect, 'amount');
                }
            }

            equipment.effects.forEach(effectFactor);

            if (equipment.action instanceof FireWeaponAction) {
                simpleFactor(equipment.action, 'power', true);
                simpleFactor(equipment.action, 'blast');
                simpleFactor(equipment.action, 'range');
                equipment.action.effects.forEach(effectFactor);
            }

            if (equipment.action instanceof ToggleAction) {
                simpleFactor(equipment.action, 'power', true);
                simpleFactor(equipment.action, 'radius');
                equipment.action.effects.forEach(effectFactor);
            }

            if (equipment.action instanceof DeployDroneAction) {
                simpleFactor(equipment.action, 'deploy_distance');
                simpleFactor(equipment.action, 'effect_radius');
                equipment.action.effects.forEach(effectFactor);
            }

            if (equipment.action instanceof MoveAction) {
                simpleFactor(equipment.action, 'distance_per_power');
            }

            if (equipment.cooldown.overheat) {
                simpleFactor(equipment.cooldown, 'overheat', true);
                simpleFactor(equipment.cooldown, 'cooling', true);
            }

            // Choose a random one
            if (modifiers.length > 0) {
                let chosen = random.choice(modifiers);
                chosen();
                equipment.price = Math.ceil(equipment.price * factor * factor);
                return true;
            } else {
                return false;
            }
        }
    }
}