/// <reference path="CharacterEquipment.ts" />

module TS.SpaceTac.UI {
    /**
     * Display a loot slot
     */
    export class CharacterLootSlot extends CharacterCargo {
        addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): boolean {
            if (!test) {
                add(this.sheet.loot_items, equipment.item);
            }
            return true;
        }
        removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): boolean {
            if (contains(this.sheet.loot_items, equipment.item)) {
                if (test) {
                    return true;
                } else {
                    return remove(this.sheet.loot_items, equipment.item);
                }
            } else {
                return false;
            }
        }
    }
}
