/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    // Types of slots
    export enum SlotType {
        Armor,
        Shield,
        Engine,
        Power,
        Weapon
    }

    // Slot to attach an equipment to a ship
    export class Slot extends Serializable {
        // Link to the ship
        ship: Ship;

        // Type of slot
        type: SlotType;

        // Currently attached equipment, null if none
        attached: Equipment;

        // Create an empty slot for a ship
        constructor(ship: Ship, type: SlotType) {
            super();

            this.ship = ship;
            this.type = type;
            this.attached = null;
        }

        // Attach an equipment in this slot
        attach(equipment: Equipment): void {
            if (this.type === equipment.slot && equipment.canBeEquipped(this.ship)) {
                this.attached = equipment;
                equipment.attached_to = this;

                if (this.ship) {
                    this.ship.updateAttributes();
                }
            }
        }
    }

}
