module TS.SpaceTac {
    // Types of slots
    export enum SlotType {
        Hull,
        Shield,
        Power,
        Engine,
        Weapon
    }

    // Slot to attach an equipment to a ship
    export class Slot {
        // Link to the ship
        ship: Ship;

        // Type of slot
        type: SlotType;

        // Currently attached equipment, null if none
        attached: Equipment | null;

        // Create an empty slot for a ship
        constructor(ship: Ship, type: SlotType) {
            this.ship = ship;
            this.type = type;
            this.attached = null;
        }

        // Attach an equipment in this slot
        attach(equipment: Equipment): Equipment {
            if (this.type === equipment.slot_type && equipment.canBeEquipped(this.ship.attributes)) {
                this.attached = equipment;
                equipment.attached_to = this;

                if (this.ship) {
                    this.ship.updateAttributes();
                }
            }
            return equipment;
        }
    }

}
