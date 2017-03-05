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
            equipment.position.set(this.x + this.parent.x + 98, this.y + this.parent.y + 98);
        }

        /**
         * Check if an equipment can be dropped in this slot
         */
        canDropEquipment(equipment: Equipment, x: number, y: number): CharacterEquipmentDrop | null {
            if (this.getBounds().contains(x, y)) {
                return {
                    message: "Unequip",
                    callback: () => this.sheet.ship.unequip(equipment)
                };
            } else {
                return null;
            }
        }
    }
}
