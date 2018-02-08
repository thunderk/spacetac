module TK.SpaceTac {
    /**
     * Generator of random ship
     */
    export class ShipGenerator {
        // Random number generator used
        random: RandomGenerator

        constructor(random = RandomGenerator.global) {
            this.random = random;
        }

        /**
         * Generate a ship of a givel level.
         * 
         * If *upgrade* is true, random levelling options will be chosen
         */
        generate(level: number, model: BaseModel | null = null, upgrade = true): Ship {
            if (!model) {
                // Get a random model
                model = BaseModel.getRandomModel(level, this.random);
            }

            let result = new Ship(null, null, model);

            result.level.forceLevel(level);
            if (upgrade) {
                let iteration = 0;
                while (iteration < 100) {
                    iteration += 1;

                    let points = result.getAvailableUpgradePoints();
                    let upgrades = model.getAvailableUpgrades(result.level.get()).filter(upgrade => {
                        return (upgrade.cost || 0) <= points && !result.level.hasUpgrade(upgrade);
                    });

                    if (upgrades.length > 0) {
                        let upgrade = this.random.choice(upgrades);
                        result.activateUpgrade(upgrade, true);
                    } else {
                        break;
                    }
                }
            }

            return result;
        }
    }
}
