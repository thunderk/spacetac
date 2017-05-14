module TS.SpaceTac {
    // A model of ship
    //  It defines the ship looks, and available slots for equipment
    export class ShipModel {
        // Code to identify the model
        code: string;

        // Human-readable model name
        name: string;

        // Minimal level to use this model
        level: number;

        // Cargo space
        cargo: number;

        // Available slots
        slots: SlotType[];

        constructor(code: string, name: string, level: number, cargo: number, ...slots: SlotType[]) {
            this.code = code;
            this.name = name;
            this.level = level;
            this.cargo = cargo;
            this.slots = slots;
        }

        // Get the default ship model collection available in-game
        static getDefaultCollection(): ShipModel[] {
            // TODO Store in cache
            var result: ShipModel[] = [];

            result.push(new ShipModel("scout", "Scout", 1, 2, SlotType.Hull, SlotType.Power, SlotType.Power, SlotType.Engine, SlotType.Weapon));

            result.push(new ShipModel("breeze", "Breeze", 1, 0, SlotType.Hull, SlotType.Power, SlotType.Power, SlotType.Engine, SlotType.Engine, SlotType.Weapon));

            result.push(new ShipModel("creeper", "Creeper", 1, 2, SlotType.Hull, SlotType.Shield, SlotType.Power, SlotType.Engine,
                SlotType.Weapon, SlotType.Weapon));

            result.push(new ShipModel("whirlwind", "Whirlwind", 1, 8, SlotType.Hull, SlotType.Shield, SlotType.Power, SlotType.Engine,
                SlotType.Weapon, SlotType.Weapon, SlotType.Weapon));

            result.push(new ShipModel("tomahawk", "Tomahawk", 1, 8, SlotType.Hull, SlotType.Shield, SlotType.Power, SlotType.Engine, SlotType.Engine,
                SlotType.Weapon, SlotType.Weapon));

            result.push(new ShipModel("avenger", "Avenger", 1, 4, SlotType.Hull, SlotType.Shield, SlotType.Shield, SlotType.Power, SlotType.Engine,
                SlotType.Weapon, SlotType.Weapon));

            result.push(new ShipModel("commodore", "Commodore", 1, 4, SlotType.Hull, SlotType.Hull, SlotType.Shield, SlotType.Power, SlotType.Engine,
                SlotType.Weapon, SlotType.Weapon));

            result.push(new ShipModel("falcon", "Falcon", 1, 2, SlotType.Hull, SlotType.Shield, SlotType.Power, SlotType.Engine,
                SlotType.Weapon, SlotType.Weapon, SlotType.Weapon, SlotType.Weapon));

            return result;
        }

        // Pick a random model in the default collection
        static getRandomModel(level: Number, random: RandomGenerator = new RandomGenerator()): ShipModel {
            var collection = this.getDefaultCollection();
            collection = collection.filter((model: ShipModel) => {
                return model.level <= level;
            });
            var result = random.choice(collection);
            if (!result) {
                console.error("Couldn't pick a random model for level " + level.toString());
            }
            return result;
        }
    }
}
