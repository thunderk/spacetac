module TS.SpaceTac {
    // Generator of random ship
    export class ShipGenerator {
        // Random number generator used
        random: RandomGenerator;

        constructor(random = RandomGenerator.global) {
            this.random = random;
        }

        // Generate a ship of a given level
        //  The ship will not be named, nor will be a member of any fleet
        generate(level: number, model: ShipModel | null = null, upgrade = false): Ship {
            if (!model) {
                // Get a random model
                model = ShipModel.getRandomModel(level, this.random);
            }

            var result = new Ship(null, undefined, model);
            var loot = new LootGenerator(this.random);

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
            result.slots.forEach((slot: Slot) => {
                var equipment = loot.generateHighest(result.skills, EquipmentQuality.COMMON, slot.type);
                if (equipment) {
                    slot.attach(equipment)
                    if (slot.attached !== equipment) {
                        console.error("Cannot attach generated equipment to slot", equipment, slot);
                    }
                }
            });

            return result;
        }
    }
}
