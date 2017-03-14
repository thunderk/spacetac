module TS.SpaceTac.UI {
    /**
     * Display a loot slot
     */
    export class LootSlot extends CharacterCargo {
        /**
         * Check if an equipment can be dropped in this slot
         */
        canDropEquipment(equipment: Equipment, x: number, y: number): CharacterEquipmentDrop | null {
            if (this.getBounds().contains(x, y) && contains(this.sheet.ship.cargo, equipment)) {
                return {
                    message: "Discard",
                    callback: () => {
                        if (this.sheet.ship.removeCargo(equipment)) {
                            add(this.sheet.loot_items, equipment);
                        }
                    }
                };
            } else {
                return null;
            }
        }
    }
}
