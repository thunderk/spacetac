module SpaceTac.Game {
    "use strict";

    // Generator of random ship
    export class ShipGenerator {
        // Random number generator used
        random: RandomGenerator;

        // Create a default ship generator
        constructor(random: RandomGenerator = null) {
            this.random = random || new RandomGenerator();
        }

        // Generate a ship of a given level
        //  The ship will not be named, nor will be a member of any fleet
        generate(level: number): Ship {
            var result = new Ship();
            var loot = new LootGenerator(this.random);

            // Add equipment slots
            result.addSlot(SlotType.Armor);
            result.addSlot(SlotType.Engine);
            result.addSlot(SlotType.Power);
            result.addSlot(SlotType.Shield);
            result.addSlot(SlotType.Weapon);

            // Fill equipment slots
            result.slots.forEach((slot: Slot) => {
                var equipment = loot.generate(new IntegerRange(level, level), slot.type);
                slot.attach(equipment);
            });

            return result;
        }
    }
}
