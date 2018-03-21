module TK.SpaceTac {
    /** 
     * Single upgrade for a ship
     * 
     * Upgrades allow for customizing a model, and are unlocked at given levels
     */
    export type ShipUpgrade = {
        // Displayable upgrade name, should be unique on the model
        code: string
        // Upgrade points cost (may be used to balance upgrades)
        cost?: number
        // Textual description of the upgrade
        description?: string
        // Optional list of upgrade codes that must be activated for this one to be available
        depends?: string[]
        // Optional list of upgrade codes that this upgrade will fully replace
        replaces?: string[]
        // Optional list of upgrade codes that conflicts with this upgrade
        conflicts?: string[]
        // List of actions that this upgrade offers
        actions?: BaseAction[]
        // List of effects that this upgrade offers
        effects?: BaseEffect[]
    }

    /** 
     * Base class for ship models.
     * 
     * A model defines the ship's design, actions, permanent effects, and levelling options.
     */
    export class ShipModel {
        constructor(
            // Code to identify the model
            readonly code = "default",
            // Human-readable model name
            readonly name = "Ship"
        ) { }

        /**
         * Check if this model is available at a given level
         */
        isAvailable(level: number): boolean {
            // TODO
            return true;
        }

        /**
         * Get a textual description of the model
         */
        getDescription(): string {
            return "";
        }

        /**
         * Get basic level upgrades
         */
        protected getStandardUpgrades(level: number): ShipUpgrade[] {
            return [
                { code: `Hull upgrade Lv${level - 1}`, effects: [new AttributeEffect("hull_capacity", 1)], cost: 3 },
                { code: `Shield upgrade Lv${level - 1}`, effects: [new AttributeEffect("shield_capacity", 1)], cost: 3 },
                { code: `Power upgrade Lv${level - 1}`, effects: [new AttributeEffect("power_capacity", 1)], cost: 3 },
            ];
        }

        /**
         * Get the list of upgrades unlocked at a given level
         */
        getLevelUpgrades(level: number): ShipUpgrade[] {
            return [];
        }

        /**
         * Get the list of upgrades activated, given a ship level and an upgrade set
         */
        getActivatedUpgrades(level: number, upgrade_codes: string[]): ShipUpgrade[] {
            let result: ShipUpgrade[] = [];

            range(level).forEach(i => {
                let upgrades = this.getLevelUpgrades(i + 1);
                if (i == 0) {
                    result = result.concat(upgrades);
                } else {
                    // TODO Apply depends, replaces and conflicts
                    upgrades.forEach(upgrade => {
                        if (contains(upgrade_codes, upgrade.code)) {
                            result.push(upgrade);
                        }
                    });
                }
            });

            return result;
        }

        /**
         * Get the list of available upgrades, given a ship level
         * 
         * This does not filter the upgrades on dependencies
         */
        getAvailableUpgrades(level: number): ShipUpgrade[] {
            return flatten(range(level).map(i => this.getLevelUpgrades(i + 1)));
        }

        /**
         * Get the list of actions at a given level and upgrades set
         * 
         * This does not include an "end turn" action.
         */
        getActions(level: number, upgrade_codes: string[]): BaseAction[] {
            return flatten(this.getActivatedUpgrades(level, upgrade_codes).map(upgrade => upgrade.actions || []));
        }

        /**
         * Get the list of permanent effects at a given level and upgrades set
         */
        getEffects(level: number, upgrade_codes: string[]): BaseEffect[] {
            return flatten(this.getActivatedUpgrades(level, upgrade_codes).map(upgrade => upgrade.effects || []));
        }

        /**
         * Get the default ship model collection available in-game
         * 
         * This scans the current namespace for model classes starting with 'Model'.
         */
        static getDefaultCollection(): ShipModel[] {
            let result: ShipModel[] = [];
            let namespace: any = TK.SpaceTac;

            for (let class_name in namespace) {
                if (class_name && class_name.indexOf("Model") == 0) {
                    let model_class = namespace[class_name];
                    if (model_class.prototype instanceof ShipModel) {
                        let model = new model_class();
                        result.push(model);
                    }
                }
            }

            return result;
        }

        /**
         * Pick a random model in the default collection
         */
        static getRandomModel(level?: number, random = RandomGenerator.global): ShipModel {
            let collection = ShipModel.getDefaultCollection();
            if (level) {
                collection = collection.filter(model => model.isAvailable(level));
            }

            if (collection.length == 0) {
                console.error("Couldn't pick a random ship model");
                return new ShipModel();
            } else {
                return random.choice(collection);
            }
        }

        /**
         * Pick random models in the default collection
         * 
         * At first it tries to pick unique models, then fill with duplicates
         */
        static getRandomModels(count: number, level?: number, random = RandomGenerator.global): ShipModel[] {
            let collection = ShipModel.getDefaultCollection();
            if (level) {
                collection = collection.filter(model => model.isAvailable(level));
            }

            if (collection.length == 0) {
                console.error("Couldn't pick a random model");
                return range(count).map(() => new ShipModel());
            } else {
                let result: ShipModel[] = [];
                while (count > 0) {
                    let picked = random.sample(collection, Math.min(count, collection.length));
                    result = result.concat(picked);
                    count -= picked.length;
                }
                return result;
            }
        }
    }
}
