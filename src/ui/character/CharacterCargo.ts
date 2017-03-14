module TS.SpaceTac.UI {
    /**
     * Display a ship cargo slot
     */
    export class CharacterCargo extends Phaser.Image {
        sheet: CharacterSheet;

        constructor(sheet: CharacterSheet, x: number, y: number) {
            super(sheet.game, x, y, "character-cargo-slot");

            this.sheet = sheet;
        }

        /**
         * Snap the equipment icon inside the slot
         */
        snapEquipment(equipment: CharacterEquipment) {
            equipment.position.set(this.x + this.parent.x + 98 * this.scale.x, this.y + this.parent.y + 98 * this.scale.y);
            equipment.setContainerScale(this.scale.x);
        }

        /**
         * Check if an equipment can be dropped in this slot
         */
        canDropEquipment(equipment: Equipment, x: number, y: number): CharacterEquipmentDrop | null {
            if (this.getBounds().contains(x, y)) {
                if (contains(this.sheet.loot_items, equipment)) {
                    return {
                        message: "Loot",
                        callback: () => {
                            if (this.sheet.ship.addCargo(equipment)) {
                                remove(this.sheet.loot_items, equipment);
                            }
                        }
                    };
                } else {
                    return {
                        message: "Unequip",
                        callback: () => this.sheet.ship.unequip(equipment)
                    };
                }
            } else {
                return null;
            }
        }
    }
}
