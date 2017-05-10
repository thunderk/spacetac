module TS.SpaceTac {
    /**
     * Generator of random ship
     */
    export class ShipGenerator {
        // Random number generator used
        random: RandomGenerator;

        constructor(random = RandomGenerator.global) {
            this.random = random;
        }

        /**
         * Generate a ship of a givel level.
         * 
         * If *upgrade* is true, the ship's upgrade points will be randomly spent before chosing equipment
         * 
         * If *force_damage_equipment, at least one "damaging" weapon will be chosen
         */
        generate(level: number, model: ShipModel | null = null, upgrade = false, force_damage_equipment = false): Ship {
            if (!model) {
                // Get a random model
                model = ShipModel.getRandomModel(level, this.random);
            }

            let result = new Ship(null, undefined, model);
            let loot = new LootGenerator(this.random);

            // Set all skills to 1 (to be able to use at least basic equipment)
            keys(result.skills).forEach(skill => result.upgradeSkill(skill));

            // Level upgrade
            result.level.forceLevel(level);
            if (upgrade) {
                while (result.getAvailableUpgradePoints() > 0) {
                    result.upgradeSkill(this.random.choice(keys(SHIP_SKILLS)));
                }
            }

            // Fill equipment slots
            result.slots.forEach(slot => {
                if (slot.type == SlotType.Weapon && force_damage_equipment) {
                    loot.setTemplateFilter(template => template.hasDamageEffect());
                    force_damage_equipment = false;
                }

                let equipment = loot.generateHighest(result.skills, EquipmentQuality.COMMON, slot.type);
                if (equipment) {
                    slot.attach(equipment)
                    if (slot.attached !== equipment) {
                        console.error("Cannot attach generated equipment to slot", equipment, slot);
                    }
                }

                loot.setTemplateFilter(() => true);
            });

            return result;
        }
    }
}
