module TS.SpaceTac.UI {
    /**
     * Display a ship slot, with equipment attached to it
     */
    export class CharacterSlot extends Phaser.Image {
        sheet: CharacterSheet;

        constructor(sheet: CharacterSheet, x: number, y: number, slot: SlotType) {
            super(sheet.game, x, y, "character-equipment-slot");

            this.sheet = sheet;

            let sloticon = new Phaser.Image(this.game, 150, 150, `character-slot-${SlotType[slot].toLowerCase()}`);
            sloticon.anchor.set(0.5, 0.5);
            this.addChild(sloticon);
        }

        /**
         * Snap the equipment icon inside the slot
         */
        snapEquipment(equipment: CharacterEquipment) {
            equipment.position.set(this.x + this.parent.x + 84 * this.scale.x, this.y + this.parent.y + 83 * this.scale.y);
            equipment.setContainerScale(this.scale.x);
        }

        /**
         * Check if an equipment can be dropped in this slot
         */
        canDropEquipment(equipment: Equipment, x: number, y: number): CharacterEquipmentDrop | null {
            if (this.getBounds().contains(x, y)) {
                return {
                    message: "Equip",
                    callback: () => this.sheet.ship.equip(equipment)
                };
            } else {
                return null;
            }
        }
    }
}
