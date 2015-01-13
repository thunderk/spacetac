module SpaceTac.Game {
    "use strict";

    export enum SlotType {Armor, Shield, Engine, Power, Weapon, }

    // Slot to attach an equipment to a ship
    export class Slot {
        // Link to the ship
        ship: Ship;

        // Type of slot
        type: SlotType;

        // Currently attached equipment
        attached: Equipment;
    }

}
