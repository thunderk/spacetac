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
        generate(level: number, model: ShipModel | null = null): Ship {
            var result = new Ship();
            var loot = new LootGenerator(this.random);

            if (!model) {
                // Get a random model
                model = ShipModel.getRandomModel(level, this.random);
            }

            // Apply model
            result.model = model.code;
            result.setCargoSpace(model.cargo);
            model.slots.forEach((slot: SlotType) => {
                result.addSlot(slot);
            });

            // Fill equipment slots
            result.slots.forEach((slot: Slot) => {
                var equipment = loot.generate(new IntegerRange(level, level), slot.type);
                if (equipment) {
                    slot.attach(equipment);
                }
            });

            return result;
        }
    }
}
