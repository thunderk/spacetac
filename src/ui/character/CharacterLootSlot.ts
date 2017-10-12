/// <reference path="CharacterCargo.ts" />
/// <reference path="CharacterEquipment.ts" />

module TK.SpaceTac.UI {
    /**
     * Display a loot slot
     */
    export class CharacterLootSlot extends CharacterCargo {
        addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
            if (!test) {
                add(this.sheet.loot_items, equipment.item);
            }
            return { success: true, info: "leave equipment" };
        }
        removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
            let info = "Loot equipment";
            if (contains(this.sheet.loot_items, equipment.item)) {
                if (test) {
                    return { success: true, info: info };
                } else {
                    let success = remove(this.sheet.loot_items, equipment.item);
                    return { success: success, info: info };
                }
            } else {
                return { success: false, info: info, error: "not lootable!" };
            }
        }
    }
}
