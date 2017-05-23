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

        constructor(code: string, name: string, level = 1, cargo = 6, default_slots = true, weapon_slots = 2) {
            this.code = code;
            this.name = name;
            this.level = level;
            this.cargo = cargo;
            this.slots = default_slots ? [SlotType.Hull, SlotType.Shield, SlotType.Power, SlotType.Engine] : [];
            range(weapon_slots).forEach(() => this.slots.push(SlotType.Weapon));
        }

        // Get the default ship model collection available in-game
        static getDefaultCollection(): ShipModel[] {
            // TODO Store in cache
            var result: ShipModel[] = [];

            result.push(new ShipModel("scout", "Scout"));
            result.push(new ShipModel("breeze", "Breeze"));
            result.push(new ShipModel("creeper", "Creeper"));
            result.push(new ShipModel("whirlwind", "Whirlwind"));
            result.push(new ShipModel("tomahawk", "Tomahawk"));
            result.push(new ShipModel("avenger", "Avenger"));
            result.push(new ShipModel("commodore", "Commodore"));
            result.push(new ShipModel("falcon", "Falcon"));
            result.push(new ShipModel("flea", "Flea"));
            result.push(new ShipModel("jumper", "Jumper"));
            result.push(new ShipModel("rhino", "Rhino"));
            result.push(new ShipModel("trapper", "Trapper"));
            result.push(new ShipModel("xander", "Xander"));

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
